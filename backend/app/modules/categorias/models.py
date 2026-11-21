from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True)  # 2..100 se valida en el schema
    descripcion: str | None = Field(default=None, max_length=255)
    activo: bool = Field(default=True)  # baja lógica: no libera el nombre único

    # Categoria 1:N Producto
    productos: list["Producto"] = Relationship(back_populates="categoria")