from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()

    def get_by_email(self, email: str) -> Usuario | None:
        return self.session.exec(
            select(Usuario).where(func.lower(Usuario.email) == email.lower())
        ).first()

    def list_all(self) -> list[Usuario]:
        """Incluye a los desactivados: el panel muestra su estado."""
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())