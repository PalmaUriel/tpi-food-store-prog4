# Food Store · Sistema de pedidos de comida

Trabajo Práctico Integrador de **Programación 4** — Tecnicatura Universitaria en Programación (UTN).

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos indicando la dirección de entrega y la forma de pago. El negocio administra categorías, productos, stock, pedidos y usuarios desde un panel de administración.

- **Repositorio:** https://github.com/PalmaUriel/tpi-food-store-prog4
- **Video de demostración:** https://drive.google.com/file/d/1NFXNuNNyG8v6GRsX1pCvuOeHfKs6dtbb/view?usp=sharing
- **Autor:** Uriel Palma

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Requisitos](#requisitos)
3. [Estructura del repositorio](#estructura-del-repositorio)
4. [Backend: instalación y ejecución](#backend-instalación-y-ejecución)
5. [Frontend: instalación y ejecución](#frontend-instalación-y-ejecución)
6. [Usuarios de prueba](#usuarios-de-prueba)
7. [Funcionalidades](#funcionalidades)
8. [API REST](#api-rest)
9. [Reglas de negocio](#reglas-de-negocio)
10. [Arquitectura](#arquitectura)
11. [Problemas frecuentes](#problemas-frecuentes)

---

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Backend | Python, FastAPI, SQLModel, PostgreSQL, python-jose (JWT), passlib + bcrypt, pydantic-settings |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query, TanStack Form, TanStack Table, React Router 7, Zustand, Axios |
| Seguridad | JWT en cookie **HttpOnly**, autorización por roles (`user` / `admin`), CORS con credenciales |

Las versiones exactas están fijadas en `backend/requirements.txt` y `frontend/package.json`.

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11, 3.12 o 3.13 (SQLModel no funciona con 3.14) |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## Estructura del repositorio

```
tpi-food-store-prog4/
├── backend/              API REST (FastAPI + SQLModel)
│   ├── app/
│   │   ├── core/         Configuración, base de datos, seguridad, dependencias, Unit of Work y repositorio base
│   │   ├── modules/      Un paquete por dominio: auth, usuarios, categorias, productos, pedidos
│   │   ├── db/seed.py    Datos iniciales (admin, categorías y productos)
│   │   └── main.py       Aplicación FastAPI, CORS y routers bajo /api/v1
│   ├── http/             Pruebas de la API para REST Client (VS Code)
│   ├── .env.example
│   └── requirements.txt
├── frontend/             Aplicación React + TypeScript
│   ├── src/
│   │   ├── shared/       Axios, TanStack Query, componentes de UI y layout
│   │   ├── features/     Un dominio por carpeta: auth, categorias, productos, pedidos, usuarios
│   │   ├── store/        authStore (sesión) y cartStore (carrito) con Zustand
│   │   └── routes/       AppRouter y ProtectedRoute
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Backend: instalación y ejecución

Los comandos son para Windows (PowerShell). En Linux o macOS, el venv se activa con `source .venv/bin/activate` y el `.env` se copia con `cp`.

**1. Crear la base de datos.** En PostgreSQL (por ejemplo, desde pgAdmin), crear una base vacía llamada `foodstore_db`. Las tablas las crea la aplicación.

**2. Entorno virtual y dependencias:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

**3. Variables de entorno.** Copiar el ejemplo y completarlo:

```bash
copy .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql+psycopg2://postgres:TU_PASSWORD@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT, **mínimo 32 caracteres** | generarla con `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (token y cookie) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

Para desarrollo también se puede usar SQLite: `DATABASE_URL=sqlite:///./foodstore.db`.

**4. Cargar los datos iniciales** (se puede ejecutar varias veces: no duplica nada):

```bash
python -m app.db.seed
```

Crea el usuario `admin`, 5 categorías y 13 productos con stock.

**5. Ejecutar la API:**

```bash
uvicorn app.main:app --reload
```

| URL | Contenido |
|---|---|
| http://localhost:8000/docs | Documentación interactiva (Swagger) |
| http://localhost:8000/redoc | Documentación (ReDoc) |
| http://localhost:8000/api/v1/health | Estado de la API |

## Frontend: instalación y ejecución

Con el backend corriendo, en otra terminal:

```bash
cd frontend
copy .env.example .env
pnpm install
pnpm build
pnpm dev
```

| Variable (`frontend/.env`) | Valor |
|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` |

`pnpm build` compila el proyecto y verifica los tipos de TypeScript. La aplicación queda en **http://localhost:5173**.

> Usar `localhost` (no `127.0.0.1`) tanto en el navegador como en `VITE_API_URL`: si se mezclan, el navegador los trata como sitios distintos y no envía la cookie de sesión.

---

## Usuarios de prueba

| Rol | Usuario | Contraseña | Cómo se obtiene |
|---|---|---|---|
| `admin` | `admin` | `Admin1234!` | Lo crea `python -m app.db.seed` |
| `user` | — | — | Registrarse desde `/register` (el registro público siempre crea usuarios `user`) |

---

## Funcionalidades

### Cliente (rol `user`)

| Ruta | Pantalla |
|---|---|
| `/` | **Catálogo** público: paginado en el servidor, búsqueda por nombre, filtro por categoría, skeleton mientras carga y estado vacío |
| `/carrito` | **Carrito** persistido en el navegador: cantidades, subtotales y total |
| `/checkout` | **Confirmar pedido**: dirección de entrega, forma de pago (efectivo o transferencia) y notas |
| `/mis-pedidos` | **Mis pedidos**: listado, detalle y cancelación de los pedidos en estado `PENDIENTE` |
| `/login`, `/register` | Inicio de sesión y registro |

### Administrador (rol `admin`)

| Ruta | Pantalla |
|---|---|
| `/admin/resumen` | Tarjetas con los indicadores del negocio (pedidos por estado, pedidos de hoy e ingresos) |
| `/admin/pedidos` | Todos los pedidos, con filtro por estado y botones para avanzar o cancelar según la máquina de estados |
| `/admin/productos` | ABM de productos y cambio rápido de stock y disponibilidad |
| `/admin/categorias` | ABM de categorías |
| `/admin/usuarios` | Usuarios con su rol y estado; activar y desactivar |

Las rutas de cliente con sesión y las de administración están protegidas en el frontend (`ProtectedRoute`) y, sobre todo, en el backend (`require_role`): ocultar un botón no reemplaza la validación del servidor.

---

## API REST

Todos los endpoints están bajo `/api/v1`. Los listados paginados reciben `skip` y `limit` (por defecto 0 y 20, máximo 100) y devuelven `{ "total": N, "items": [...] }`.

| Recurso | Endpoints | Acceso |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/token`, `POST /auth/logout`, `GET /auth/me` | Público / sesión |
| Usuarios | `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar`, `POST /admin/usuarios/{id}/desactivar` | `admin` |
| Categorías | `GET /categorias`, `GET /categorias/{id}` · `POST`, `PUT`, `DELETE` | Lectura pública · escritura `admin` |
| Productos | `GET /productos?search=&categoria_id=&disponible=`, `GET /productos/{id}` · `POST`, `PUT`, `PATCH /productos/{id}/stock`, `DELETE` | Lectura pública · escritura `admin` |
| Pedidos | `POST /pedidos`, `GET /pedidos`, `GET /pedidos/{id}`, `PATCH /pedidos/{id}/cancelar` | Sesión (el cliente solo accede a los suyos) |
| Pedidos (admin) | `GET /pedidos/resumen`, `PATCH /pedidos/{id}/estado` | `admin` |

El detalle de cada endpoint, con sus schemas y códigos de respuesta, está en `/docs`. La carpeta `backend/http/` tiene pruebas listas para ejecutar con la extensión REST Client de VS Code (`auth.http`, `catalogo.http` y `pedidos.http`).

**Códigos de error comunes:** `401` sin sesión o sesión vencida, `400` cuenta desactivada o regla de negocio violada, `403` rol no permitido o pedido ajeno, `404` recurso inexistente o dado de baja, `409` nombre, usuario o email repetido, `422` datos inválidos.

---

## Reglas de negocio

| Regla | Descripción |
|---|---|
| RN-01 | Crear un pedido: al menos un ítem y sin productos repetidos; cada producto debe estar activo, disponible y con stock suficiente. El stock se descuenta y las líneas copian el nombre y el precio del producto. **Todo ocurre en una sola transacción**: si falla un ítem, no se guarda nada. |
| RN-02 | Máquina de estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde `PENDIENTE` o `EN_PREPARACION`. `ENTREGADO` y `CANCELADO` son terminales. Una transición inválida responde 400. |
| RN-03 | Cancelar un pedido **restituye el stock** de cada línea en la misma transacción que cambia el estado. |
| RN-04 | El cliente solo ve y cancela sus propios pedidos, y solo en `PENDIENTE`. El admin ve todos y puede avanzar o cancelar cualquier pedido no terminal. |
| RN-05 | Las líneas y el total de un pedido no cambian después de creado (no hay endpoints de edición ni de borrado de pedidos). |
| RN-06 | La forma de pago es `EFECTIVO` o `TRANSFERENCIA`, y la dirección de entrega tiene entre 5 y 200 caracteres. |

Categorías y productos usan **baja lógica** (`activo = false`) y los usuarios se desactivan con `disabled = true`. Un registro dado de baja se trata como inexistente (404).

---

## Arquitectura

### Backend: capas por módulo

```
Router  →  Service  →  Unit of Work  →  Repository  →  Model
(HTTP)     (reglas)    (transacción)    (consultas)    (tablas)
```

- **Router:** valida la entrada con los schemas, resuelve la sesión y el rol con `Depends`, llama al Service y traduce las excepciones de dominio a códigos HTTP.
- **Service:** aplica las reglas de negocio dentro de `with self.uow as uow:` y devuelve el schema de salida dentro del bloque.
- **Unit of Work:** abre la sesión y hace **commit** al salir sin errores o **rollback** si hubo una excepción. Es el único lugar del código que confirma cambios.
- **Repository:** consultas con `select`, sin reglas de negocio. Todos heredan de `BaseRepository[T]`.

### Frontend: organización por features

Cada carpeta de `features/` agrupa las páginas, componentes, hooks, llamadas a la API y tipos de un dominio, y espeja un módulo del backend.

- **Estado del servidor** (catálogo, pedidos, usuarios y resumen): **TanStack Query**, con invalidación de las consultas después de cada cambio.
- **Estado del cliente:** **Zustand** con `persist`. `authStore` guarda solo los datos del usuario en `sessionStorage` (nunca el token) y `cartStore` guarda el carrito en `localStorage`.
- **Sesión:** el JWT viaja en una cookie **HttpOnly** que el navegador adjunta en cada petición (`withCredentials: true`); el frontend nunca lee ni guarda el token. El interceptor de Axios limpia la sesión ante un `401` o una cuenta desactivada, y `ProtectedRoute` redirige al login.

---

## Problemas frecuentes

| Problema | Solución |
|---|---|
| `String should have at least 32 characters` al iniciar el backend | La `SECRET_KEY` del `.env` es muy corta. Generar una con el comando de la tabla de variables. |
| `ModuleNotFoundError` al ejecutar el backend | El entorno virtual no está activado. Ejecutar `.venv\Scripts\activate`. |
| Error al instalar dependencias o al borrar `.venv` / `node_modules` en Windows | La ruta del proyecto es demasiado larga (límite de 260 caracteres). Mover el proyecto a una carpeta corta, por ejemplo `C:\proyectos\`. |
| El login funciona pero las páginas protegidas responden 401 | Se mezcló `localhost` con `127.0.0.1`. Usar `localhost` en el navegador y en `VITE_API_URL`. |
| Error de CORS en el navegador | `FRONTEND_ORIGIN` del backend tiene que coincidir con la dirección del frontend (`http://localhost:5173`). |
| `UnicodeDecodeError` al conectar con PostgreSQL | Postgres rechazó la conexión (contraseña incorrecta o base inexistente) y el mensaje viene en español con tildes. Revisar `DATABASE_URL` y que exista la base `foodstore_db`. |
