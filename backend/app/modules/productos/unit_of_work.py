from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Productos + categorías sobre la misma sesión: al crear o editar un producto
    hay que verificar que su categoría exista y esté activa."""

    productos: ProductoRepository
    categorias: CategoriaRepository

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self