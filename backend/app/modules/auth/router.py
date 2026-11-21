from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.modules.auth.schemas import Mensaje, UserCreate, UserPublic
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: ServiceDep) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.post("/token", response_model=Mensaje)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: ServiceDep,
) -> Mensaje:
    """Formulario OAuth2 (username y password). El JWT va SOLO en la cookie, no en el cuerpo."""
    try:
        token = service.login(form.username, form.password)
    except CredencialesInvalidas as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, str(e), headers={"WWW-Authenticate": "Bearer"}
        ) from e
    except CuentaDesactivada as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,  # JavaScript no la puede leer
        samesite="lax",  # localhost:5173 y localhost:8000 son el mismo "sitio"
        secure=False,  # en producción (HTTPS) va en True
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # 30 minutos, igual que el token
        path="/",
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response) -> Mensaje:
    """Público: borra la cookie aunque la sesión ya haya vencido."""
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: Annotated[Usuario, Depends(get_current_active_user)]) -> UserPublic:
    return UserPublic.model_validate(usuario)