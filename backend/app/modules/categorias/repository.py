from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca entre TODAS (también las dadas de baja): la baja no libera el nombre."""
        return self.session.exec(
            select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        ).first()

    def get_activa(self, categoria_id: int) -> Categoria | None:
        categoria = self.get_by_id(categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def list_activas(self) -> list[Categoria]:
        return list(
            self.session.exec(
                select(Categoria).where(Categoria.activo).order_by(Categoria.nombre)
            ).all()
        )