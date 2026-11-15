# Matriz de tecnologías — Primera, segunda y tercera entrega

Leyenda: **Se mantiene** (sin cambios) · **Cambia** (se reemplaza por algo mejor) · **Se agrega** (nuevo). Cada decisión sigue el esquema *necesidad → decisión → implementación → evidencia*.

| Área | 1ª entrega (v1.1.1) | 2ª entrega (v1.1.2) | 3ª entrega (v1.1.3) | Estado | Justificación (necesidad → decisión) | Evidencia |
|---|---|---|---|---|---|---|
| Runtime y servidor | Node.js + Express | Node.js + Express 5 | Node.js + Express 5 | **Se mantiene** | Es la base de la materia; no hay motivo para cambiarla | `package.json` |
| Sistema de módulos | CommonJS (`require`) | ECMAScript (`import/export`) | ECMAScript | **Cambia** en la 2ª | Lo pidió la consigna; mismo estándar que el navegador | `"type": "module"` |
| Arquitectura | MVC (rutas, controladores, modelos) | MVC + middlewares + fábrica CRUD | MVC + **capa de Servicios** | **Se agrega** servicios | Las reglas de pedidos estaban dentro del controlador (150 líneas); la teoría propone Rutas → Controladores → Servicios → Modelos | `services/pedidos.service.js` |
| Persistencia | Archivos JSON | MongoDB local + Mongoose | **MongoDB Atlas** + Mongoose | **Cambia** en 2ª y 3ª | JSON no escala ni valida; Atlas permite acceso desde la nube (necesario para desplegar) | `config/db.js`, `MONGO_URI` |
| Modelado | Clases `Persona`/`Cliente` (POO) | Esquemas Mongoose, referencias y `populate` | + **índices** en pedidos y auditoría | **Cambia** y **se agrega** | Evitar recorrer toda la colección en cada filtro | `models/Pedido.js` |
| Configuración | Valores en el código | `.env` + `dotenv` | `.env` + **validación al arrancar** (`config/env.js`) | **Se agrega** | Fallar rápido si falta un secreto en producción | `config/env.js` |
| Validaciones | En el controlador | Middlewares + esquema + frontend, reglas compartidas (`reglas.js`) | Igual; la política de clave corre antes del hash | **Se mantiene** | Ya estaban en 3 capas y coherentes | `public/js/reglas.js` |
| Vistas | Pug estática | Pug + formularios con **Fetch** y DOM | + layout con **logo 96×96**, menú servido por Pug, diseño móvil | **Se mantiene** y mejora | Navegación sencilla y adaptable (pedido de la 3ª) | `views/layout.pug`, `styles.css` |
| Autenticación | — | Login con encabezado `x-usuario-id` (transitorio, falsificable) | **JWT firmado en cookie `httpOnly`** | **Cambia** | El encabezado podía falsificarse; el JWT solo se puede emitir con `JWT_SECRET` | `auth.service.js`, `auth.middleware.js` |
| Contraseñas | — | Política validada, guardada en texto plano | **Hash PBKDF2 + sal** (`crypto` nativo) | **Cambia** | Nunca guardar claves en texto plano (Bloque 8.0); se usa lo visto en clase, sin dependencia extra | `models/Usuario.js` |
| Autorización | — | 6 roles, permisos por ruta y por transición | + **páginas protegidas en el servidor** | **Se mantiene** y se completa | En la 2ª las páginas HTML se abrían sin sesión | `protegerVista` |
| Sesión | — | `sessionStorage` en el navegador | Cookie `httpOnly` + `sameSite` + `secure` en producción | **Cambia** | JavaScript ya no puede leer la sesión (protege del XSS) | `opcionesCookie()` |
| Tiempo real | — | — | **Socket.IO** (chat y avisos de pedidos) | **Se agrega** | El problema del caso: nadie ve en el momento si un pedido cambió | `sockets/chatSocket.js` |
| Inteligencia artificial | — | — | **Gemini** con prompt de FreshRoute y datos reales | **Se agrega** | Asistente que orienta al personal sobre estados, roles y cantidades | `services/geminiService.js`, `prompts/` |
| Pruebas | Thunder Client (manual) | `node:test` (32 pruebas) | **Jest** (unitarias) + `node:test` + `socket.io-client` (integración): 65 pruebas | **Se agrega** | Módulo 13: pruebas unitarias de lógica pura; integración de API, seguridad y sockets | `test/` |
| Trazabilidad | `fecha` del pedido | `timestamps`, auditoría, historial de estados | + auditoría de LOGIN/LOGOUT y consultas a la IA | **Se mantiene** y amplía | Saber quién hizo qué y cuándo | `models/Auditoria.js` |
| Despliegue | Local | Local (Compass) | **Render** (backend) + **Atlas** (base) | **Se agrega** | Render admite servidores persistentes y WebSockets; Vercel es serverless | `doc/DESPLIEGUE.md` |
| Control de versiones | Git y GitHub | Git y GitHub | Ramas por integrante, commits convencionales, Pull Requests y etiquetas v1.1.1/v1.1.2/v1.1.3 | **Se mantiene** y se ordena | Historial trazable y entrega previa diferenciada de la final | `CONTRIBUTING.md` |

## Qué se evaluó y NO se incorporó
| Tecnología | Motivo |
|---|---|
| Passport (`passport-local` + `express-session`) | Solo tiene sentido con varias estrategias (Google, Facebook…) o cuando se prefiere sesión en servidor. Con un único login propio, JWT en cookie es más simple y no necesita un almacén de sesiones |
| bcrypt | PBKDF2 con sal (visto en clase) cumple el mismo objetivo sin dependencia extra |
| Vercel | No es adecuado para un servidor Express con WebSockets persistentes (ver `doc/DESPLIEGUE.md`) |
| `helmet`, límite de intentos de login, paginación | Mejoras válidas fuera del alcance; quedan como deuda pendiente |
| Registro público de usuarios | Los roles los asigna el administrador; un chofer no puede auto-asignarse un rol |
