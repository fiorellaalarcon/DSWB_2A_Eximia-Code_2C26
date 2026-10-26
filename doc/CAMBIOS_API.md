# Cambios de la API respecto de la primera entrega

La primera entrega no tenía autenticación. Ahora **todas las rutas de `/api` (salvo `POST /api/auth/login`) exigen el encabezado `x-usuario-id`**.
Por eso las pruebas de Thunder Client/Postman de la primera entrega deben agregar ese encabezado y usar los nuevos nombres de campos.

## Rutas
| Recurso | 1ª entrega | 2ª entrega | Motivo |
|---|---|---|---|
| Login | — | `POST /api/auth/login` | Usuarios y roles |
| Clientes | `GET/POST/PUT/DELETE /api/clientes` | igual; `DELETE` = **baja lógica**; + `PATCH /:id/reactivar`; `?nombre=` | Historial |
| Productos | idem | igual; `DELETE` = baja lógica; + `reactivar`; `?nombre=` | Historial |
| Repartidores | — | `/api/repartidores` (CRUD, baja lógica, `?disponible=true`) | Regla del caso |
| Pedidos | `GET/POST/PUT/DELETE`, `PATCH /:id/estado` | `GET/POST/PUT`, `PATCH /:id/estado`; **se elimina `DELETE`** (se cancela); `?cliente=&estado=` | Un pedido es un hecho del negocio |
| Usuarios | — | `/api/usuarios` (solo administrador) | Gestión de accesos |
| Auditoría | — | `GET /api/auditoria` | Trazabilidad |

**Usuarios con rol `repartidor`:** el cuerpo de `POST/PUT /api/usuarios` lleva `"repartidor": "<_id del repartidor>"` (obligatorio para ese rol; un repartidor no puede tener dos cuentas). Para el repartidor, `GET /api/pedidos` devuelve solo sus pedidos y `/api/clientes`, `/api/productos` y `/api/repartidores` responden 403.

## Cuerpos (body)
| Concepto | 1ª entrega | 2ª entrega |
|---|---|---|
| Identificador | `id` numérico (1, 2, 3…) | `_id` de MongoDB (texto de 24 caracteres) |
| Crear pedido | `{ "clienteId": 1, "productos": [{ "productoId": 1, "cantidad": 2 }] }` | `{ "cliente": "<_id>", "items": [{ "producto": "<_id>", "cantidad": 2 }] }` |
| Filtro por cliente | `?clienteId=1` | `?cliente=<_id>` |
| Cambiar estado | `{ "estado": "Preparado" }` | igual; para `En camino` agregar `"repartidor": "<_id>"` |
| Respuesta de pedido | `clienteId`, `productos`, `fecha` | `cliente`, `items` (con `precioUnitario`), `total`, `repartidor`, `historialEstados`, `createdAt`, `updatedAt`, `siguientesEstados` |

## Códigos de estado nuevos
`401` sin identificar · `403` el rol no tiene permiso · `409` regla de negocio (transición no permitida, repartidor no disponible, duplicado, baja con pedidos en curso).
