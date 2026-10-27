# Pruebas — FreshRoute (2ª entrega)

Ejecutar: `npm test` (necesita MongoDB encendido; usa la base `freshroute_test`, que se borra al terminar).
Herramienta: `node:test` (incluida en Node, sin dependencias). Las pruebas manuales con Thunder Client/Postman están en la 1ª entrega.
Alcance: áreas críticas, 1–5 pruebas por módulo (la cátedra indica que no es necesario ahondar).

| N° | Módulo | Objetivo | Procedimiento | Resultado esperado |
|---|---|---|---|---|
| T1 | Auth | Login válido | POST login con credenciales correctas | 200, rol, sin password |
| T2 | Auth | Clave incorrecta | POST login con clave mala | 401 |
| T3 | Auth | API protegida | GET /api/clientes sin `x-usuario-id` | 401 |
| T4 | Roles | Directivo solo lee | Directivo hace POST /api/clientes | 403 |
| T5 | Roles | Depósito no administra clientes | Depósito hace POST /api/clientes | 403 |
| T6 | Roles | Planificador gestiona repartidores, no productos | POST repartidor / POST producto | 201 / 403 |
| T7 | Validación | Middleware | POST cliente con campos vacíos y email inválido | 400 + lista de errores |
| T8 | Roles | Historial restringido | Administrativo pide `?incluirInactivos=true` | 403 |
| T9 | Roles | Usuarios solo del administrador | GET /api/usuarios con directivo / administrador | 403 / 200 |
| T9b | Usuarios | Usuario repartidor exige vínculo | POST usuario rol repartidor sin repartidor / con uno ya vinculado | 400 / 409 |
| T9d | Validación | Política de contraseña (backend) | POST usuario con claves débiles (corta, sin mayúscula, sin minúscula, sin especial) y con una válida | 400 con error en `password` / 201 |
| T9e | Base de datos | Última capa: el esquema valida solo | `Usuario.create` con clave débil y `Cliente.create` con email sin `@`, salteando la API | `ValidationError` |
| T9c | Roles | Repartidor sin acceso a datos de oficina | Repartidor hace GET clientes, productos y repartidores | 403 |
| T10 | Baja lógica | No se borra; reactiva solo el administrador | Baja; lista de activos; historial del directivo; reactivar | 200 / ausente / presente / 403 y 200 |
| T11 | Clientes | Unicidad | POST con email repetido | 409 |
| T12 | Pedidos | Regla: ≥1 producto | POST con `items: []` | 400 |
| T13 | Pedidos | Existencia relacionada | POST con cliente inexistente | 404 |
| T14 | Pedidos | Depósito no crea pedidos | POST pedido con depósito | 403 |
| T15 | Pedidos | Alta y pasos por rol | POST válido; GET con depósito y con planificador | Pendiente, total 300; depósito ve [Preparado], planificador ve [] |
| T16 | Pedidos | Transición inválida | Pendiente → Entregado | 409 |
| T17 | Pedidos | Rol equivocado | Planificador prepara / depósito despacha | 403 / 403 (depósito prepara: 200) |
| T18 | Pedidos | Repartidor obligatorio | Preparado → En camino sin repartidor | 400 |
| T19 | Pedidos | Entrega la confirma el repartidor | En camino ocupa al repartidor; el planificador intenta Entregado; lo hace el repartidor | disponible false; 403; 200 y disponible true |
| T20 | Pedidos | Estado final | Entregado → Pendiente | 409 |
| T21 | Pedidos | Repartidor ocupado | Despachar otro pedido con el mismo repartidor | 409 |
| T21b | Pedidos | Repartidor ve solo lo suyo | GET /api/pedidos con repartidor y con otro repartidor | solo los suyos / lista vacía; paso permitido: [Entregado] |
| T21c | Pedidos | No toca pedidos ajenos | Otro repartidor hace GET y PATCH Entregado | 403 y 403 |
| T21d | Pedidos | Repartidor no crea, prepara ni despacha | POST pedido; PATCH Preparado | 403 y 403 |
| T21e | Pedidos | Repartidor cierra su entrega | PATCH Entregado sobre su pedido | 200; repartidor libre |
| T22 | Pedidos | Cancelado no se envía | Cancelar y luego En camino | 409 |
| T23 | Pedidos | Consultas | GET ?cliente=&estado= | 200, 2 resultados (ambos Entregado) |
| T24 | Auditoría | Trazabilidad y permiso | GET auditoría con directivo / depósito | ≥5 registros / 403 |

Última ejecución: **32 de 32 aprobadas**.
