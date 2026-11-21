from datetime import datetime, timezone

from app.core.utils import ahora
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

# ---------- Máquina de estados (RN-02) ----------
# Para cada estado, a cuáles se puede pasar. Los terminales no tienen salida.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# ---------- Excepciones de dominio (el Router las traduce a HTTP) ----------

class PedidoNoEncontrado(Exception):  # 404
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):  # 404
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado")


class PedidoAjeno(Exception):  # 403
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):  # 400: base de las reglas que se violan
    pass


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {stock}, se pidieron {pedido}")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar de {actual} a {nuevo}")


class CancelacionNoPermitida(ReglaDeNegocio):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se pueden cancelar pedidos PENDIENTE (estado actual: {estado})")


# ---------- Casos de uso ----------

class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ----- RN-01: crear el pedido desde el carrito, todo o nada -----
    def crear(self, data: PedidoCreate, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            repetidos = {i for i in ids if ids.count(i) > 1}
            if repetidos:
                raise ProductoRepetido(min(repetidos))

            pedido = Pedido(
                usuario_id=usuario.id,  # type: ignore[arg-type]
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad  # se descuenta en la misma iteración
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)
        # Si cualquier validación lanza una excepción, el __exit__ del Unit of Work
        # hace rollback: no queda ni el pedido ni el descuento de stock.

    # ----- Lecturas (RN-04: el cliente solo ve lo suyo) -----
    def listar(
        self, usuario: Usuario, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if usuario.role == "admin" else usuario.id
            pedidos, total = uow.pedidos.list_by_usuario(
                skip=skip, limit=limit, usuario_id=filtro_usuario, estado=estado
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # ----- RN-02 y RN-03: el admin avanza o cancela -----
    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, data.estado)
            return PedidoRead.model_validate(pedido)

    # ----- RN-03 y RN-04: el dueño cancela, solo en PENDIENTE -----
    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise CancelacionNoPermitida(pedido.estado)
            self._aplicar_transicion(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # ----- Panel de administración -----
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(_inicio_del_dia()),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )

    # ---------- Auxiliares ----------

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        """Valida contra el mapa ANTES de modificar. Si cancela, restituye el stock."""
        if nuevo not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(pedido.estado, nuevo)

        if nuevo == "CANCELADO":  # RN-03: misma transacción que el cambio de estado
            for item in pedido.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is not None:
                    producto.stock += item.cantidad
                    uow.productos.add(producto)

        pedido.estado = nuevo
        pedido.updated_at = ahora()
        uow.pedidos.add(pedido)


def _inicio_del_dia() -> datetime:
    """Medianoche de hoy en la hora local del servidor, expresada en UTC."""
    local = datetime.now().astimezone()
    medianoche = local.replace(hour=0, minute=0, second=0, microsecond=0)
    return medianoche.astimezone(timezone.utc)