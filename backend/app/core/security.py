from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ---------- Contraseñas ----------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash bcrypt de la contraseña (incluye una sal aleatoria)."""
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Compara la contraseña ingresada con el hash guardado."""
    return pwd_context.verify(password, hashed_password)


# ---------- JWT ----------

def create_access_token(subject: str) -> str:
    """JWT firmado con SECRET_KEY. 'sub' = username, 'exp' = vencimiento."""
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expira}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Valida firma y vencimiento. Devuelve el username, o None si el token no sirve."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:  # firma alterada, token vencido o mal formado
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None