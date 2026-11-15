# Alcance de la tercera entrega (entrega final) — FreshRoute (Caso 2)

## 1. Objetivo
Evolucionar la aplicación de la segunda entrega con los contenidos de la etapa final: **seguridad real** (hash de contraseñas y autenticación con JWT en cookie), **MongoDB Atlas**, **despliegue en Render**, **WebSockets con Socket.IO** (chat y avisos en tiempo real) integrando un **asistente de IA (Gemini)**, una **capa de Servicios**, **pruebas** unitarias y de integración, y **mejoras de frontend** (logo, navegación y diseño adaptable). Cada cambio está justificado en `doc/MATRIZ_TECNOLOGIAS.md`.

## 2. Qué incluye (según la consigna final)
| Requisito | Dónde está |
|---|---|
| Node.js + Express, rutas dinámicas, middlewares y asincronía revisados | `app.js`, `routes/`, `middlewares/`, `async/await` en todo el recorrido |
| Ruteo y controladores organizados; patrón MVC con Servicios | `routes/`, `controllers/` (delgados), `services/`, `models/`, `views/` |
| MongoDB (Atlas) con modelo coherente | `models/`, `config/db.js`, `MONGO_URI`, índices |
| Autenticación y autorización (JWT, cookies) | `services/auth.service.js`, `middlewares/auth.middleware.js`, `roles.middleware.js`, `protegerVista` |
| Hash de contraseñas | PBKDF2 + sal en `models/Usuario.js` |
| Manejo de errores y middlewares personalizados | `error.middleware.js`, `validaciones.middleware.js`, `auth.middleware.js` |
| Variables de entorno y configuración separada | `.env.example`, `config/env.js` (validación al arrancar) |
| Despliegue y Mongo Atlas | `doc/DESPLIEGUE.md`, `GET /health` |
| WebSockets, chat e IA | `sockets/chatSocket.js`, `services/geminiService.js`, `prompts/`, `views/chat.pug` |
| Mejoras de frontend (logo 96×96, mensajes, tablas, confirmaciones, móvil) | `views/layout.pug`, `public/css/styles.css`, `public/js/` |
| Pruebas | `test/unit` (Jest) y `test/integration` (`node:test`), `test/README.md` |
| Matriz de tecnologías, diagramas y análisis de requerimientos | `doc/MATRIZ_TECNOLOGIAS.md`, `doc/DIAGRAMAS.md`, documento PDF |

## 3. Qué se mantiene
Las reglas de negocio de FreshRoute (estados, transiciones por rol, repartidor disponible), los 6 roles, la baja lógica, la auditoría, las validaciones en tres capas con `reglas.js`, la fábrica CRUD y los formularios con Fetch. No se rehízo lo que ya funcionaba.

## 4. Qué NO incluye y por qué
| Fuera de alcance | Motivo |
|---|---|
| Passport / `express-session` | Con un único login propio, JWT en cookie es más simple y no requiere almacén de sesiones. Passport se justificaría con varias estrategias (Google, etc.) |
| bcrypt | PBKDF2 con sal (visto en clase) cumple el mismo objetivo sin dependencia extra |
| Vercel | No es adecuado para WebSockets persistentes; se usa Render |
| Registro público de usuarios | Los roles los asigna el administrador |
| `helmet`, límite de intentos de login, paginación, refresco de tokens | Mejoras válidas; quedan como deuda pendiente |
| Persistencia del historial del chat | El chat guarda los últimos mensajes en memoria; no es un requisito |
| App de choferes, GPS, telemetría y mapas | Corresponde a Ingeniería de Software, no al backend de esta entrega |
| Facturación a 30 días, penalizaciones, stock | El alcance del caso es registrar pedidos y controlar su estado |

## 5. Limitaciones conocidas
- El plan gratuito de Render "duerme" el servicio tras un tiempo sin uso (el primer acceso tarda).
- El acceso de red de Atlas está abierto a `0.0.0.0/0` (necesario con Render gratuito); se compensa con una contraseña fuerte y un usuario de base con permisos mínimos.
- El historial del chat se pierde al reiniciar el servidor.
- El JWT dura 1 hora y no tiene refresco: al vencer hay que volver a iniciar sesión.
- La respuesta del asistente depende de un servicio externo (cuota y disponibilidad de la API key).
