from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# ---------- Excepciones de dominio ----------

class UsuarioDuplicado(Exception):
    def __init__(self, campo: str) -> None:
        super().__init__(f"Ya existe un usuario con ese {campo}")


class CredencialesInvalidas(Exception):
    def __init__(self) -> None:
        super().__init__("Usuario o contraseña incorrectos")


class CuentaDesactivada(Exception):
    def __init__(self) -> None:
        super().__init__(CUENTA_DESACTIVADA)


# ---------- Casos de uso ----------

class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise UsuarioDuplicado("username")
            if uow.usuarios.get_by_email(data.email) is not None:
                raise UsuarioDuplicado("email")
            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=data.email.lower(),
                    hashed_password=hash_password(data.password),
                    role="user",  # el registro público nunca crea admins
                )
            )
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Devuelve el JWT si las credenciales son correctas."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            # Mismo mensaje si no existe el usuario o si la contraseña está mal:
            # así no se revela qué usernames están registrados.
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token(usuario.username)