from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_activo(self, producto_id: int) -> Producto | None:
        producto = self.get_by_id(producto_id)
        return producto if producto is not None and producto.activo else None

    def search(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados y paginados. Devuelve (página, total sin paginar)."""
        consulta = select(Producto).where(Producto.activo)
        if search:
            # ilike = LIKE sin distinguir mayúsculas y minúsculas
            consulta = consulta.where(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            consulta = consulta.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            consulta = consulta.where(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        items = self.session.exec(consulta.order_by(Producto.id).offset(skip).limit(limit)).all()
        return list(items), total