from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import ahora

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario

TZ = DateTime(timezone=True)


class Pedido(SQLModel, table=True):
    """No se borra: se cancela. El total queda fijo desde la creación (RN-05)."""

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)  # EFECTIVO | TRANSFERENCIA (RN-06)
    direccion_entrega: str = Field(max_length=200)  # 5..200 (RN-06)
    notas: str | None = Field(default=None, max_length=500)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora, sa_type=TZ)
    updated_at: datetime = Field(default_factory=ahora, sa_type=TZ)

    # Usuario 1:N Pedido
    usuario: "Usuario" = Relationship(back_populates="pedidos")
    # Pedido 1:N DetallePedido (composición: las líneas pertenecen al pedido)
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Línea inmutable (RN-05): copia el nombre y el precio del producto."""

    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int  # >= 1 se valida en el schema
    nombre_producto: str = Field(max_length=120) 
    precio_unitario: float 
    subtotal: float  

    # Pedido 1:N DetallePedido
    pedido: Pedido = Relationship(back_populates="items")
    # Producto 1:N DetallePedido
    producto: "Producto" = Relationship(back_populates="detalles")