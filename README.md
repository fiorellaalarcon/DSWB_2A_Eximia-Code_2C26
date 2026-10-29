# FreshRoute — Eximia Code (Segunda entrega)

# Desarrollo de Sistemas Web (Back End) — 2° A — 2C2026 · Caso 2: Distribución de Pedidos “FreshRoute”

•	Carpeta Drive: 
https://drive.google.com/drive/folders/1DIdFfikiBLpY_M7adQ7gS02nxS6y_cJL?usp=sharing

•	GitHub: 
https://github.com/fiorellaalarcon/DSWB_2A_Eximia-Code_2C26

•	Link al Video de las entregas:
1° parcial: https://drive.google.com/file/d/13FJ2l6Ig-kQTDpDHzRFaP_HdFP51kCij/view?usp=sharing
2° parcial: https://drive.google.com/file/d/1IhBv8rT4i2CVdOwhDH4SutLOmAwW8mAm/view?usp=sharing

### Integrantes
- Alarcón, Fiorella Melina
- Alva, Axel Roni
- Churquina, Javier
- Jasque Cano, Malena Concepción

Backend + interfaz Pug para registrar clientes, productos, repartidores y pedidos, controlando el estado de cada entrega.

## Caso 2: 
FreshRoute realiza entregas de alimentos a restaurantes. El sistema necesita registrar los pedidos y controlar su estado durante la distribución.
## Problemática
Los pedidos se registran manualmente y los empleados no tienen una forma centralizada de consultar si una entrega fue preparada, despachada o entregada.

## Alcance del sistema
El backend administrará:
Clientes.
Pedidos.
Productos.
Repartidores.

El alcance de esta segunda entrega está detallado en `doc/alcance.md`

## Estados de entrega.
Estados posibles
Un pedido podrá encontrarse en:
Pendiente.
Preparado.
En camino.
Entregado.
Cancelado.

## Reglas de negocio
Un pedido debe estar asociado a un cliente.
Un pedido debe contener al menos un producto.
Un pedido entregado no puede volver a estado pendiente.
Un pedido cancelado no puede ser enviado.
Solo un repartidor disponible puede recibir un pedido para entregar.

## Qué cambió respecto de la primera entrega
| Tema | 1ª entrega | 2ª entrega |
|---|---|---|
| Módulos | CommonJS (`require`) | **ECMAScript Modules** (`import/export`, `"type": "module"`) |
| Persistencia | Archivos JSON (`data/`, `jsonStorage.js`) | **MongoDB + Mongoose** (`config/db.js`, `models/`) |
| Configuración | Valores en el código | **`.env`** (`MONGO_URI`, `PORT`) |
| Validaciones | En controlador/modelo | **Middlewares** (`validaciones.middleware.js`) + esquema Mongoose |
| Usuarios | No había | **Login + 6 roles del caso** y permisos por ruta y por transición de estado |
| Borrado | `DELETE` eliminaba | **Baja lógica** (`activo:false`) con historial |
| Trazabilidad | Solo `fecha` | `createdAt/updatedAt`, `creadoPor/modificadoPor`, **auditoría**, **historial de estados** |
| Interfaz | Página de presentación | **Pug + Fetch + DOM**: altas, ediciones y consultas **sin recargar** |
| Repartidores | “Próximo módulo” | Implementado (solo un repartidor disponible recibe un pedido) |
| Pruebas | Thunder Client | Thunder Client (1ª) + `test/` automático (32 pruebas) |

Detalle de rutas y cuerpos modificados: `docs/CAMBIOS_API.md`.

## Roles (los del caso FreshRoute)
El caso describe oficina (administrativos), operadores de depósito, planificadores de rutas, choferes/repartidores en la calle y dirección. Cada rol corresponde a una persona real del negocio:

| Rol | Persona del caso | Puede | No puede |
|---|---|---|---|
| `administrativo` | Personal administrativo | Clientes y productos (alta, edición, baja); crear/editar pedidos Pendientes; cancelar Pendiente/Preparado | Preparar ni despachar |
| `deposito` | Operador de depósito | Preparar: Pendiente → Preparado | Crear pedidos, despachar |
| `planificador` | Planificador de rutas | Repartidores; despachar (Preparado → En camino con repartidor disponible); cancelar en ruta | Confirmar entregas, crear ni preparar pedidos |
| `repartidor` | Chofer / repartidor | Ver **solo sus pedidos** (con la dirección de entrega); confirmar la entrega (En camino → Entregado) **solo en sus pedidos** | Ver clientes, productos ni pedidos de otros; crear, preparar o despachar |
| `directivo` | Dirección | Leer todo, ver inactivos (historial) y auditoría | Crear o modificar |
| `administrador` | Sistemas | Usuarios, reactivar registros, ver inactivos y auditoría | Operar pedidos |

**Quién hace cada cambio de estado** (los estados finales Entregado y Cancelado no tienen salida):
| Desde → Hacia | Rol |
|---|---|
| Pendiente → Preparado | deposito |
| Pendiente → Cancelado | administrativo |
| Preparado → En camino | planificador |
| Preparado → Cancelado | administrativo o planificador |
| En camino → Entregado | **repartidor asignado** (solo sobre sus pedidos) |
| En camino → Cancelado | planificador |

Cada usuario `repartidor` está **vinculado a su registro de la flota**; así el sistema sabe cuáles son sus pedidos y rechaza (403) que cierre los de otro chofer. El planificador, que trabaja en la oficina, ya no confirma entregas: lo hace quien las realiza (esto responde a la desconexión entre planificadores y choferes que describe el caso).
Los demás roles pueden **consultar** pedidos, clientes, productos y repartidores; escribir requiere el rol indicado. El repartidor solo accede a `/api/pedidos` (lo suyo).

## Requisitos
Node.js 20+ · npm · MongoDB local (**MongoDB Community Server** + **MongoDB Compass**) · Visual Studio Code (recomendado).

## Instalación y ejecución
```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env  -> revisar MONGO_URI
npm run seed             # carga datos de ejemplo y los usuarios de prueba
npm run dev              # o: npm start  ->  http://localhost:3000
npm test                 # 32 pruebas automáticas (base separada: freshroute_test)
```
Con Compass: conectarse a `mongodb://127.0.0.1:27017` y abrir la base `freshroute`.

## Usuarios de prueba (contraseñas en texto plano, ver limitaciones)
| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin.123` | administrador de sistemas |
| `administrativo` | `Oficina.123` | administrativo (oficina) |
| `deposito` | `Deposito.123` | operador de depósito |
| `planificador` | `Planif.123` | planificador |
| `directivo` | `Direct.123` | directivo |
| `repartidor1` | `Repa.1234` | repartidor (Carlos Pérez; tiene un pedido En camino de ejemplo) |
| `repartidor2` | `Repa.5678` | repartidor (Lucía Gómez) |

## `admin` vs `administrativo`
No son lo mismo (separación de funciones). **`administrativo`** es personal de la *oficina de FreshRoute*: carga clientes, productos y pedidos. **`admin` (rol `administrador`)** es el *administrador del sistema*: da de alta usuarios, reactiva registros y mira la auditoría, pero **no opera pedidos**. Así quien maneja los accesos no es quien maneja el negocio.

## Validaciones en tres capas (coherentes)
Las reglas están escritas **una sola vez** en `public/js/reglas.js` y las importan las tres capas, así no pueden contradecirse:

| Capa | Dónde | Qué hace |
|---|---|---|
| 1. Frontend | `public/js/validaciones.js` | Avisa antes de enviar el `fetch` (obligatorios, número mínimo, email, contraseña) |
| 2. Backend | `middlewares/validaciones.middleware.js` | Valida siempre de nuevo antes del controlador (400 con lista de errores) |
| 3. Base de datos | `models/*.js` (esquemas Mongoose) + índices `unique` | Última barrera aunque se salteen las anteriores |

- **Contraseña** (al crear o cambiar un usuario): mínimo 8 caracteres, con mayúsculas, minúsculas y un carácter especial (por ejemplo `. , ; ! _ -`). En el login solo se exige completarla.
- **Email de clientes**: debe llevar `@` y dominio (`texto@dominio.ext`).
- Se guardan **sin hash, sin cifrado y sin tokens** (limitación declarada, ver abajo).

## Estructura (MVC)
```
config/db.js          conexión a MongoDB
models/               esquemas Mongoose (Usuario, Cliente, Producto, Repartidor, Pedido, Auditoria)
controllers/          lógica (crud.factory.js evita repetir el CRUD)
routes/               endpoints; cada verbo declara qué roles lo usan
middlewares/          auth, roles, validaciones, errores, logger
services/             auditoría
utils/                AppError, manejarAsync, consultas
views/                plantillas Pug (formularios)
public/js/            JavaScript del navegador (fetch + DOM)
scripts/seed.js       datos iniciales
test/                 pruebas automáticas + documentación
docs/                 alcance y cambios de la API
app.js / server.js    configuración de Express / arranque
```

## API (resumen) — salvo login, requiere el encabezado `x-usuario-id`
| Recurso | Endpoints |
|---|---|
| Auth | `POST /api/auth/login` |
| Clientes / Productos / Repartidores | `GET /` (`?nombre=`, `?disponible=`, `?incluirInactivos=true`), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (baja lógica), `PATCH /:id/reactivar` |
| Pedidos | `GET /` (`?cliente=&estado=`; el repartidor solo recibe los suyos), `GET /:id`, `POST /`, `PUT /:id` (solo Pendiente), `PATCH /:id/estado` |
| Usuarios (admin) | CRUD + baja + reactivar en `/api/usuarios` |
| Auditoría | `GET /api/auditoria?entidad=&accion=&limite=` |

Códigos: 200/201 ok · 400 datos inválidos · 401 sin identificar · 403 sin permiso · 404 no existe · 409 regla de negocio · 500 interno.

## Limitaciones conocidas (documentadas a propósito)
- **Contraseñas sin hash ni cifrado**: se validan (política de 8 caracteres, mayúsculas, minúsculas y especial) pero se guardan y comparan en texto plano porque aún no se vio hash/encriptación. **No es seguro para producción.** La comparación está aislada en `Usuario.verificarPassword()` para incorporar bcrypt luego.
- **Sin sesiones, cookies ni JWT** (aún no vistos): el navegador guarda el usuario en `sessionStorage` y cada fetch envía `x-usuario-id`; el servidor lo verifica en MongoDB y toma el rol de la base. Un id en un encabezado puede falsificarse: es transitorio y se reemplaza solo en `auth.middleware.js`.
- Las **páginas HTML** se pueden abrir sin login (el servidor no tiene sesión); lo que protege los datos es la API, que responde 401/403. El JS redirige al login, pero eso es comodidad, no seguridad.
- Ocultar botones según el rol es comodidad de la interfaz; los permisos reales se aplican en el servidor.

## Flujo de trabajo en GitHub
Ver `CONTRIBUTING.md`.

## Declaración de uso de IA
### Herramienta utilizada
Se utilizó Claude Sonnet 5.5 (Anthropic) como herramienta de asistencia durante el desarrollo de la segunda entrega de FreshRoute. Su uso estuvo orientado a resolver dudas técnicas, analizar el código de la primera entrega, evaluar alternativas de implementación y obtener propuestas iniciales de código y documentación.
La asistencia se aplicó principalmente a la migración a ES Modules y Mongoose, las validaciones, los permisos por rol, la auditoría, la interfaz Pug con Fetch y las pruebas automáticas.

### Aplicación y revisión por parte del equipo
Las propuestas generadas por la IA fueron revisadas y adaptadas por el grupo de acuerdo con los requisitos del caso FreshRoute. El equipo trabajó sobre las reglas de negocio, los permisos de cada rol, las transiciones de estado de los pedidos, las validaciones y la integración de los distintos módulos.
Para comprobar el funcionamiento del sistema, se ejecutó la aplicación y se realizaron pruebas automáticas mediante `npm test`. También se revisaron los permisos, los flujos de los pedidos y las validaciones, realizando los ajustes necesarios durante el desarrollo.
La documentación inicial también fue revisada, mejorada y completada por el equipo, incluyendo capturas y explicaciones del proyecto. Cada integrante explica en el video el código de su parte, y la integración y el funcionamiento general fueron revisados por el grupo.
Las limitaciones están documentadas expresamente y no se presentan como prácticas seguras.

### Referencias y recursos externos
- **Claude (Anthropic):** https://claude.ai/
- **Repositorio del proyecto:** https://github.com/fiorellaalarcon/DSWB_2A_Eximia-Code_2C26
- **Documentación oficial de MongoDB:** https://www.mongodb.com/docs/
- **Documentación oficial de Mongoose:** https://mongoosejs.com/docs/
- **Documentación oficial de Express:** https://expressjs.com/
- **Documentación oficial de Pug:** https://pugjs.org/

La IA se utilizó como herramienta de apoyo durante el desarrollo, sin sustituir la revisión técnica, las decisiones de implementación ni la responsabilidad del equipo sobre el resultado final.
