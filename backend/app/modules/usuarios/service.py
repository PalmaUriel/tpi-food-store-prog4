from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# ---------- Excepciones de dominio (el Router las traduce a HTTP) ----------

class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"Usuario {usuario_id} no encontrado")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("No podés desactivar tu propia cuenta")


# ---------- Casos de uso del panel de administración ----------

class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise AutoDesactivacion()
        return self._cambiar_estado(usuario_id, disabled=True)

    def _cambiar_estado(self, usuario_id: int, disabled: bool) -> UserPublic:
        """Idempotente: responde igual aunque el usuario ya estuviera en ese estado."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(usuario_id)
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)