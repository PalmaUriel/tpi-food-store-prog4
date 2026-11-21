from datetime import datetime
from typing import Literal

from sqlmodel import Field, SQLModel

from app.core.schemas import Paginado

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]


# ---------- Entrada ----------

class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """El carrito que confirma el cliente. El usuario sale de la sesión, no del cuerpo."""

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago  # RN-06
    direccion_entrega: str = Field(min_length=5, max_length=200)  # RN-06
    notas: str | None = Field(default=None, max_length=500)


class CambioEstado(SQLModel):
    estado: EstadoPedido


# ---------- Salida ----------

class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]  # desde la relación Pedido.items


class PedidosPaginados(Paginado[PedidoRead]):
    """{ "total": N, "items": [...] }"""


class ResumenPedidos(SQLModel):
    """Indicadores del panel de administración."""

    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float