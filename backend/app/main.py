from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401  registra TODOS los modelos antes de usar cualquiera
from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.pedidos.router import router as pedidos_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema de pedidos de comida — TPI Programación 4",
    version="1.0.0",
    lifespan=lifespan,
    # /docs (Swagger) y /redoc vienen activados por defecto
)

# CORS con credenciales: sin allow_credentials el navegador descarta la cookie.
# Con credenciales no se puede usar "*": hay que nombrar el origen del frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix=API_PREFIX)


@api.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


api.include_router(auth_router)
api.include_router(usuarios_router)
api.include_router(categorias_router)
api.include_router(productos_router)
api.include_router(pedidos_router)

app.include_router(api)