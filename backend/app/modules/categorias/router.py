from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorías"])

SoloAdmin = Depends(require_role(["admin"]))


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


# ---------- Lecturas: públicas ----------

@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


# ---------- Escrituras: solo admin ----------

@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[SoloAdmin],
)
def crear_categoria(data: CategoriaCreate, service: ServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=[SoloAdmin])
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.delete(
    "/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[SoloAdmin]
)
def eliminar_categoria(categoria_id: int, service: ServiceDep) -> None:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e