from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos + productos sobre la MISMA sesión: crear un pedido descuenta stock
    y cancelarlo lo restituye, y las dos cosas tienen que confirmarse juntas."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self