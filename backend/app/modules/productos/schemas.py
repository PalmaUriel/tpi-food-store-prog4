from sqlmodel import Field, SQLModel

from app.core.schemas import Paginado
from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    """PUT con actualización parcial: solo se modifican los campos enviados."""

    nombre: str | None = Field(default=None, min_length=1, max_length=120)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None


class ProductoStockUpdate(SQLModel):
    """PATCH /productos/{id}/stock"""

    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead  # se arma desde la relación Producto.categoria


class ProductosPaginados(Paginado[ProductoRead]):
    """{ "total": N, "items": [...] }"""