from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

Sesion = Annotated[Usuario, Depends(get_current_active_user)]
SoloAdmin = Depends(require_role(["admin"]))


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


def _a_http(e: Exception) -> HTTPException:
    """Traduce cada excepción de dominio a su código HTTP."""
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    if isinstance(e, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(e))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(e))  # ReglaDeNegocio


ERRORES = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: Sesion, service: ServiceDep) -> PedidoRead:
    try:
        return service.crear(data, usuario)
    except ERRORES as e:
        raise _a_http(e) from e


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: Sesion,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    """Propios (user) o todos (admin)."""
    return service.listar(usuario, skip, limit, estado)


# Se declara ANTES de /{pedido_id}: si no, FastAPI intentaría leer "resumen" como un id
@router.get("/resumen", response_model=ResumenPedidos, dependencies=[SoloAdmin])
def resumen_pedidos(service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: Sesion, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except ERRORES as e:
        raise _a_http(e) from e


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=[SoloAdmin])
def cambiar_estado(pedido_id: int, data: CambioEstado, service: ServiceDep) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data)
    except ERRORES as e:
        raise _a_http(e) from e


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: Sesion, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except ERRORES as e:
        raise _a_http(e) from e