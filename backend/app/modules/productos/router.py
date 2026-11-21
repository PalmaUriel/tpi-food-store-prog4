from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])

SoloAdmin = Depends(require_role(["admin"]))


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


# ---------- Lecturas: públicas ----------

@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(description="Busca en el nombre")] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


# ---------- Escrituras: solo admin ----------

@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[SoloAdmin],
)
def crear_producto(data: ProductoCreate, service: ServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=[SoloAdmin])
def actualizar_producto(
    producto_id: int, data: ProductoUpdate, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=[SoloAdmin])
def actualizar_stock(
    producto_id: int, data: ProductoStockUpdate, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.delete(
    "/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[SoloAdmin]
)
def eliminar_producto(producto_id: int, service: ServiceDep) -> None:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e