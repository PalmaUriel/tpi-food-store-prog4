from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

COOKIE_NAME = "access_token"
CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


class OAuth2PasswordBearerCookie(OAuth2PasswordBearer):
    """Igual que OAuth2PasswordBearer, pero lee el token de la cookie HttpOnly
    en vez del encabezado Authorization. Swagger sigue mostrando el candado."""

    async def __call__(self, request: Request) -> str:  # type: ignore[override]
        token = request.cookies.get(COOKIE_NAME)
        if not token:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "No autenticado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token


oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    """Valida el JWT de la cookie (firma y vencimiento) y carga el usuario. 401 si no sirve."""
    credenciales_invalidas = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Sesión inválida o vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = decode_access_token(token)
    if username is None:
        raise credenciales_invalidas
    usuario = UsuarioRepository(session).get_by_username(username)
    if usuario is None:
        raise credenciales_invalidas
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Rechaza a los usuarios con disabled = True (400)."""
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    """Fábrica de dependencias: require_role(["admin"]) deja pasar solo a esos roles (403)."""

    def verificar_rol(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "No tenés permisos para realizar esta acción"
            )
        return usuario

    return verificar_rol