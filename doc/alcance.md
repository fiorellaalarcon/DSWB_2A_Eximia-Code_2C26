# Alcance de la segunda entrega — FreshRoute (Caso 2)

## 1. Objetivo de esta entrega
Mejorar la aplicación de la primera entrega (backend de distribución de pedidos) aplicando los contenidos de la segunda etapa: MongoDB con Mongoose, ECMAScript, middlewares, async/await, formularios con Fetch, usuarios con roles y trazabilidad. Todo cambio respecto de la primera entrega está registrado en el documento y en `docs/CAMBIOS_API.md`.

## 2. Qué incluye
| Requisito de la consigna | Dónde está |
|---|---|
| Arquitectura modular y organizada (MVC) | `models/`, `controllers/`, `routes/`, `views/`, `middlewares/`, `services/`, `config/` |
| MongoDB con Mongoose, sin archivos JSON | `config/db.js`, `models/*.js`; datos de ejemplo con `scripts/seed.js` |
| Variables de entorno | `.env` (no se sube) y `.env.example`; `MONGO_URI` |
| Middlewares, rutas, controladores y manejo de errores | `middlewares/`, `routes/`, `controllers/`, `error.middleware.js` (400/401/403/404/409/500) |
| Validaciones simples con middlewares | `validaciones.middleware.js`; mismas reglas en el frontend y en los esquemas (`public/js/reglas.js`) |
| async/await | Controladores, conexión a la base y `fetch` del navegador |
| ECMAScript (sin CommonJS) | `"type": "module"`, `import/export` |
| Login, usuarios, roles y permisos | `Usuario.js`, `auth.controller.js`, `roles.middleware.js` (6 roles tomados del caso) |
| Formularios Pug con Fetch, sin recargar | `views/*.pug`, `public/js/` (alta, edición, consulta, mensajes y errores) |
| Baja lógica, fechas y auditoría | `activo`, `timestamps`, `creadoPor/modificadoPor`, colección `auditorias`, `historialEstados` |
| Reglas del caso FreshRoute | Pedido con cliente y ≥ 1 producto; transiciones de estado; Entregado no vuelve a Pendiente; Cancelado no se envía; solo un repartidor disponible recibe un pedido |
| Pruebas documentadas | `test/` (32 pruebas automáticas) y `test/README.md`; pruebas manuales con Thunder Client en la 1ª entrega |
| Documentación, roles del equipo, bibliografía, uso de IA y video | Documento PDF, README y video de 12 minutos aprox.|

## 3. Qué se conserva de la primera entrega
Node.js + Express, patrón MVC, rutas y controladores por módulo, Pug, middleware logger y de errores, parámetros de ruta y de consulta, códigos HTTP y las reglas de negocio de los pedidos. No se rehízo lo que ya funcionaba.

## 4. Qué NO incluye y por qué
| Fuera de alcance | Motivo |
|---|---|
| Hash o cifrado de contraseñas (bcrypt) | Aún no se vio. La contraseña se **valida** (8+ caracteres, mayúsculas, minúsculas y un carácter especial) pero se guarda en texto plano: **no es seguro para producción**. La comparación está aislada en `verificarPassword()` para incorporarlo después |
| Sesiones, cookies y JWT | Aún no se vieron. La identificación transitoria usa el encabezado `x-usuario-id` verificado en MongoDB; se reemplaza solo en `auth.middleware.js` |
| MongoDB Atlas | Es de la tercera entrega; se usa Compass local. Cambiar a Atlas implica solo modificar `MONGO_URI` |
| Librerías de validación (express-validator, Joi) y frameworks de frontend | No se vieron; se valida a mano con JavaScript |
| Seguimiento en tiempo real, mapas y telemetría | Pertenecen a la parte de Ingeniería de Software del caso, no al alcance del caso de backend de esta entrega |
| Facturación a 30 días, penalizaciones, inventario/stock | El alcance del caso es registrar pedidos y controlar su estado |
| Paginación, reportes y paneles | No exigidos; evitar complejidad innecesaria |
| Protección de las páginas HTML en el servidor | Requiere sesiones; la API sí está protegida (401/403) |

## 5. Elementos agregados y su justificación (sin sobreingeniería)
| Elemento | Por qué se agregó |
|---|---|
| Módulo Repartidores | El enunciado lo incluye en el alcance y exige la regla «solo un repartidor disponible recibe un pedido». La 1ª entrega lo dejó pendiente |
| Colección de auditoría | La consigna y conforme lo visto en clase se pide evaluar cómo registrar quién hizo cada acción importante y cuándo |
| 6 roles (administrativo, depósito, planificador, repartidor, directivo, administrador) | Salen de las personas que describe el caso; cada cambio de estado lo hace quien lo ejecutaría realmente (mínimo privilegio) |
| `crud.factory.js` | Evita repetir el mismo CRUD con baja lógica en clientes, productos y repartidores (reducción de redundancia) |
| `manejarAsync` | Reenvía errores de async/await al middleware de errores sin repetir `try/catch` |
| `reglas.js` compartido | Mantiene coherentes las validaciones del frontend, el backend y la base de datos |

Todo es JavaScript y Express sin librerías adicionales, y cada integrante puede explicar la pieza que le corresponde.

## 6. Limitaciones conocidas
- Contraseñas sin hash ni cifrado y sin tokens (ver sección 4).
- El encabezado `x-usuario-id` puede falsificarse; es una solución transitoria declarada.
- Ocultar botones según el rol es comodidad de la interfaz; los permisos reales los aplica el servidor.
- Los choferes figuran como usuarios con rol `repartidor`, pero la aplicación móvil de choferes no forma parte de esta entrega.

## 7. Vínculo con Ingeniería de Software (acotado al backend)
Los requerimientos funcionales (registrar pedidos, controlar estados, consultar por cliente y estado, asignar repartidores) y los no funcionales (seguridad y control de acceso, integridad y fiabilidad por validación en tres capas, trazabilidad por auditoría, mantenibilidad por MVC y `.env`) están desarrollados en el documento. No se incluye el trabajo de Ingeniería de Software de forma literal.

Se excluyen Funcionalidades avanzadas no exigidas en esta etapa. La decisión de no implementar estos elementos busca mantener la entrega dentro del alcance del segundo parcial y evitar adelantar funcionalidades de etapas posteriores.
