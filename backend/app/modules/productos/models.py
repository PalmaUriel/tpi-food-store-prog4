from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(max_length=120)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float  # >= 0 se valida en el schema
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0)  # >= 0; se descuenta al crear un pedido (RN-01)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)  # baja lógica

    # Categoria 1:N Producto
    categoria: "Categoria" = Relationship(back_populates="productos")
    # Producto 1:N DetallePedido
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")