# Guía de colaboración — Entrega final (v1.1.3)

Plan de trabajo en equipo con **ramas por integrante**, **commits convencionales** y **Pull Requests**. El equipo son **4 integrantes**.
## 1. Ramas
| Rama | Responsable | Contenido |
|---|---|---|
| `main` | — | Código estable de la entrega. **Nadie hace push directo**: solo se actualiza por Pull Request |
| `feat/despliegue-config-docs` | **Fiorella Alarcón** | Entrada de la app, configuración, Atlas/Render y documentación |
| `feat/seguridad-jwt-hash` | **Malena Jasque** | Hash de contraseñas, JWT en cookie, vistas protegidas |
| `feat/frontend-ux-chat` | **Axel Alva** | Layout con logo, diseño móvil, pantalla de chat, Fetch, pruebas de reglas |
| `feat/servicios-tiempo-real-ia-tests` | **Javier Churquina** | Capa de servicios, WebSockets, Gemini, índices, seed y pruebas |

**Dependencias:** Fiorella (base) → Malena (la usan los sockets y las vistas) → Javier (sockets e IA usan la autenticación) → Axel (pantallas que usan los sockets). La aplicación completa solo arranca cuando las 4 ramas están en integradas.
**Orden de merge:** 1) Fiorella, 2) Malena, 3) Javier, 4) Axel.

## 2. Convención de commits (Conventional Commits)
Formato: `tipo(alcance): descripción breve en minúsculas, en presente, sin punto final`
| Tipo | Se usa para |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un error |
| `refactor` | Cambiar el código sin cambiar el comportamiento |
| `perf` | Mejora de rendimiento |
| `test` | Agregar o ajustar pruebas |
| `docs` | Documentación |
| `style` | Formato o estilos (CSS) sin lógica |
| `chore` | Configuración, dependencias, scripts |
Reglas: un commit = un cambio con sentido; **nunca** subir `.env`, `node_modules/` ni claves (`GEMINI_API_KEY`, `MONGO_URI`, `JWT_SECRET`); cada integrante commitea solo sus archivos.

## 3. Pasos en GitHub Desktop (cada integrante)
1. *File → Clone repository* (o *Fetch origin* si ya lo tiene). 
2. *Current Branch → New Branch*: nombre de **su rama**.
3. Copiar **sus archivos** a la carpeta del repositorio, respetando las subcarpetas.
4. En *Changes*: tildar los archivos de **un commit**, escribir **Summary** (título) y **Description** (ver tablas) y *Commit to <rama>*. Repetir por cada fila de su tabla.
5. *Push origin* → *Create Pull Request* (base `develop`) con el **título y la descripción** de la sección 5.
6. **Otro integrante revisa** (*Files changed*), comenta o aprueba, y hace el merge con **«Create a merge commit»** (conserva los commits individuales como evidencia del aporte).
7. Todos:  *Fetch origin* → *Pull origin*.
8. Con `main` completa: `npm install`, `npm run seed`, `npm test`. Se crea la etiqueta `v1.1.3` (sección 6).

## 4. Plan de commits por integrante
> Cada fila es un commit. **Título** = *Summary*; **Descripción** = *Description* en GitHub Desktop.

### Fiorella — `feat/despliegue-config-docs`
| Archivos | Título | Descripción |
|---|---|---|
| `package.json`, `package-lock.json` | `chore(deps): agrega JWT, cookie-parser, Socket.IO y Gemini; configura scripts y Jest` | Actualiza la versión del proyecto a 1.1.3. Incorpora dependencias para autenticación JWT, manejo de cookies, comunicación en tiempo real mediante Socket.IO e integración con Gemini. Configura scripts de inicio, desarrollo, carga de datos iniciales y generación de secretos. Incorpora Jest y Socket.IO Client para pruebas unitarias y de integración. |
| `.env.example` | `chore(config): documenta variables de entorno` | Agrega JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL, NODE_ENV y la cadena de Atlas de ejemplo. Agrega las variables necesarias para configurar el entorno de desarrollo y producción: puerto, entorno, conexión a MongoDB local y Atlas, base de datos de pruebas, secreto JWT y configuración del asistente Gemini. Incluye valores de ejemplo sin credenciales reales. |
| `config/env.js` | `feat(config): valida variables obligatorias al arrancar` |  Incorpora la validación de las variables de entorno obligatorias MONGO_URI y JWT_SECRET. Comprueba que el secreto JWT tenga un mínimo de 32 caracteres y detiene el arranque mediante un error si falta alguna variable o la configuración no cumple los requisitos. Incluye la función esProduccion() para identificar el entorno de ejecución. La app falla rápido si falta MONGO_URI o JWT_SECRET, o si el secreto es corto. |
| `config/db.js` | `feat(db): conexión compatible con atlas` | Misma función para local y Atlas; tiempo de espera de 10 s si el cluster no responde. Centraliza la conexión a MongoDB mediante Mongoose utilizando MONGO_URI, compatible tanto con instancias locales como con MongoDB Atlas. Configura un tiempo máximo de espera de 10 segundos para evitar bloqueos cuando el servidor no responde. Si la conexión falla, informa el error y finaliza el proceso. |
| `config/servidor.js` | `feat(config): servidor http compartido por express y socket.io` | `crearServidor(app)` evita duplicar la configuración entre index.js y los tests. Centraliza la creación del servidor HTTP mediante createServer(app) y monta Socket.IO sobre la misma instancia. Configura los eventos de comunicación en tiempo real mediante configurarSocket(io) y almacena la instancia de Socket.IO en Express para que los servicios puedan acceder a ella. Exporta crearServidor(app), reutilizable tanto desde index.js como desde las pruebas, evitando duplicar la configuración. |
| `index.js` (nuevo) y `server.js` (se elimina) | `refactor(app): reemplaza server.js por index.js como punto de entrada` | Carga .env, valida, conecta a la base y escucha con http + Socket.IO. Reemplaza server.js por index.js como punto de entrada de la aplicación. Incorpora la carga de variables de entorno, la validación de la configuración obligatoria y la conexión a MongoDB antes de iniciar el servidor. Integra Express y Socket.IO mediante el servidor HTTP compartido y agrega el manejo de errores durante el arranque. |
| `app.js` | `feat(app): cookie-parser, endpoint /health y trust proxy` | Lee la cookie del JWT, chequeo de salud para Render y encabezados más seguros. Incorpora cookie-parser para procesar las cookies y permitir la lectura del JWT de autenticación. Configura trust proxy para reconocer las solicitudes recibidas mediante un proxy HTTPS, como Render, y deshabilita el encabezado X-Powered-By. Agrega el endpoint /health para verificar el estado de la aplicación durante el despliegue y mantiene centralizada la configuración de Express, sus middlewares y rutas. |
| `doc/MATRIZ_TECNOLOGIAS.md` | `docs(matriz): tecnologías de las tres entregas` | Qué se mantiene, cambia o agrega, con justificación y evidencia. Documenta la evolución tecnológica de FreshRoute entre las tres entregas mediante una matriz comparativa. Identifica qué tecnologías se mantienen, cuáles se reemplazan y cuáles se incorporan, justificando cada decisión según las necesidades del proyecto. Incluye la implementación y la evidencia correspondiente en el código, además de las tecnologías evaluadas que no se incorporaron y sus motivos. |
| `doc/DIAGRAMAS.md` | `docs(diagramas): casos de uso, clases, er y secuencias` | Seis diagramas Mermaid del sistema. Incorpora seis diagramas Mermaid para documentar la arquitectura y el comportamiento del backend de FreshRoute. Incluye casos de uso por roles, diagrama de clases, modelo entidad-relación de MongoDB y tres diagramas de secuencia que representan la autenticación JWT, la actualización de pedidos con notificaciones en tiempo real mediante Socket.IO y la interacción con el asistente de inteligencia artificial Gemini. |
| `doc/DESPLIEGUE.md` | `docs(despliegue): guía de atlas y render` | Elección Render vs Vercel y pasos con verificación. Documenta el procedimiento de despliegue de FreshRoute mediante MongoDB Atlas y Render. Justifica la elección de Render frente a Vercel por el uso de conexiones persistentes con Socket.IO. Detalla la configuración de Atlas, la conexión del repositorio de GitHub, las variables de entorno, el servicio Node y el health check. Incorpora pasos de verificación del funcionamiento y una tabla de problemas frecuentes con sus posibles soluciones. |
| `doc/alcance.md`, `doc/CAMBIOS_API.md` | `docs(alcance): alcance y cambios de la api de la entrega final` | Qué incluye y qué no, limitaciones, cambios por cookie JWT. Documenta el alcance funcional de la tercera entrega de FreshRoute, identificando las funcionalidades incorporadas, las reglas de negocio que se mantienen, los elementos que quedan fuera del alcance y las limitaciones conocidas. Registra la evolución de la API entre las entregas, incluyendo el reemplazo del encabezado x-usuario-id por autenticación mediante JWT en cookie httpOnly, los nuevos endpoints de login, logout y consulta de sesión, el endpoint público /health y la protección de las páginas según sesión y rol. Describe también la incorporación de Socket.IO para el chat y las notificaciones en tiempo real, y los cambios en el almacenamiento de contraseñas mediante hash y sal. |
| `README.md`, `CONTRIBUTING.md` | `docs: readme e instrucciones de colaboración` | Instalación local y en la nube, usuarios de prueba, seguridad, ramas y commits. Actualiza el README con la presentación de FreshRoute, sus funcionalidades, tecnologías, estructura del proyecto e instrucciones necesarias para comprender y ejecutar la aplicación. Documenta los requisitos de instalación, la configuración de variables de entorno, la conexión con MongoDB local o Atlas y las indicaciones para el despliegue en Render, junto con los mecanismos de verificación y los usuarios de prueba disponibles. Amplía el CONTRIBUTING con las instrucciones de colaboración del equipo, organización de ramas, convenciones de commits, flujo de Pull Requests y descripción de los cambios realizados por cada integrante, facilitando la trazabilidad y revisión del desarrollo. |

### Malena — `feat/seguridad-jwt-hash`
| Archivos | Título | Descripción |
|---|---|---|
| `services/auth.service.js` | `feat(auth): hash pbkdf2 con sal y jwt firmado` | Hash con `crypto`, comparación en tiempo constante, JWT con solo el id y opciones seguras de cookie |
| `models/Usuario.js` | `feat(usuarios): guarda passwordhash y sal en lugar de la clave` | Campo virtual `password`; la política de clave se valida antes de hashear; el hash nunca sale en el JSON |
| `middlewares/auth.middleware.js` | `feat(auth): identifica por jwt en cookie y protege vistas` | Reemplaza x-usuario-id; el rol se lee de la base; `protegerVista` redirige al login |
| `controllers/auth.controller.js`, `routes/auth.routes.js` | `feat(auth): login con cookie httponly, logout y /yo` | Mensaje genérico de error, auditoría de ingresos y cierres de sesión |
| `routes/vistas.routes.js`, `config/menu.js` | `feat(vistas): páginas protegidas por rol y menú servido por el servidor` | Sin sesión redirige a /login; el menú se filtra por rol |
| `utils/cookies.js` | `feat(utils): lectura de cookie para el handshake de socket.io` | Permite autenticar WebSockets con el mismo JWT |
| `test/unit/auth.service.test.js` | `test(auth): pruebas unitarias de hash y jwt` | Hash con sal, verificación, token alterado |

### Axel — `feat/frontend-ux-chat`
| Archivos | Título | Descripción |
|---|---|---|
| `public/img/logo-freshroute.webp` | `feat(ui): agrega el logo de freshroute 96x96` | Reemplazar el archivo de ejemplo por el logo oficial (96×96) |
| `views/layout.pug`, `views/login.pug` | `feat(ui): encabezado con logo, menú por rol y pie` | Logo arriba a la izquierda, navegación accesible y datos de usuario provistos por el servidor |
| `public/css/styles.css` | `style(ui): diseño adaptable a móviles y estilos del chat` | Menú desplegable, tablas con scroll, foco visible y logo reducido en pantallas chicas |
| `public/js/auth.js`, `api.js`, `login.js`, `layout.js` | `refactor(front): sesión por cookie en lugar de sessionstorage` | El navegador ya no guarda ni envía el id del usuario; logout y menú móvil |
| `views/chat.pug`, `public/js/chat.js` | `feat(chat): pantalla de chat en tiempo real con socket.io` | Mensajes con textContent, contador de conectados y avisos de error |
| `views/pedidos.pug`, `public/js/pedidos.js` | `feat(pedidos): la lista se actualiza sola en tiempo real` | Escucha `pedido:actualizado` y recarga la tabla |
| `test/unit/reglas.test.js` | `test(reglas): pruebas unitarias de contraseña y email` | Casos válidos e inválidos de la política compartida |

### Javier — `feat/servicios-tiempo-real-ia-tests`
| Archivos | Título | Descripción |
|---|---|---|
| `services/pedidos.service.js`, `controllers/pedidos.controller.js` | `refactor(pedidos): mueve las reglas de negocio a la capa de servicios` | El controlador solo coordina; una consulta `$in` reemplaza una consulta por producto; emite eventos de tiempo real |
| `models/Pedido.js`, `models/Auditoria.js` | `perf(db): índices para consultas por cliente, estado y fecha` | Evita recorrer toda la colección en cada filtro |
| `sockets/chatSocket.js` | `feat(sockets): chat autenticado con jwt y límites de uso` | Nombre desde el servidor, validación de mensajes, historial corto y espera entre consultas a la IA |
| `services/geminiService.js`, `services/contexto.service.js` | `feat(ia): integración con gemini con datos operativos reales` | Clave y modelo por .env, tiempo máximo de espera y solo cantidades agregadas (sin datos personales) |
| `prompts/asistente-freshroute.txt` | `feat(ia): prompt del asistente de operaciones de freshroute` | Estados, roles, reglas y restricciones; el asistente se identifica como IA |
| `scripts/seed.js` | `fix(seed): exige --force contra bases remotas` | Evita borrar datos de Atlas por error |
| `test/integration/api.test.js` (y se elimina `test/api.test.js`) | `test(integracion): api, seguridad, roles y websockets con cookies` | 43 pruebas con login real y clientes Socket.IO |
| `test/unit/transiciones.test.js`, `test/README.md` | `test(unitarias): transiciones por rol y documentación de pruebas` | Jest para la lógica pura y tabla de pruebas |

## 5. Pull Requests (título y descripción)
**Plantilla de descripción:** *Qué cambia · Por qué (necesidad) · Cómo probar · Evidencia · Checklist* (`npm test` pasa · sin secretos · README actualizado si corresponde · revisado por otra persona).

**PR de Fiorella** — Título: `feat: configuración, despliegue en Atlas/Render y documentación final`
> **Qué cambia:** nuevo `index.js` como entrada, validación de variables de entorno, servidor HTTP compartido con Socket.IO, `/health`, dependencias y documentación (matriz, diagramas, despliegue, alcance, README).
> **Por qué:** la entrega final exige despliegue en la nube, MongoDB Atlas y documentación completa.
> **Cómo probar:** `cp .env.example .env`, completar `JWT_SECRET` y `npm run dev` (arranca cuando estén integradas las demás ramas).
> **Checklist:** [ ] sin `.env` en el commit [ ] README revisado [ ] enlaces de la documentación verificados

**PR de Malena** — Título: `feat(seguridad): hash de contraseñas y autenticación con JWT en cookie`
> **Qué cambia:** las contraseñas se guardan con PBKDF2 + sal; el login emite un JWT en cookie `httpOnly`; las páginas se protegen en el servidor; se elimina el encabezado `x-usuario-id`.
> **Por qué:** el encabezado se podía falsificar y las claves estaban en texto plano.
> **Cómo probar:** `npm run seed`, iniciar sesión, abrir `/clientes` sin sesión (redirige a `/login`) y mirar en Compass que `usuarios` tenga `passwordHash` y `salt`.
> **Checklist:** [ ] pruebas S1–S6 en verde [ ] el hash no aparece en ninguna respuesta

**PR de Axel** — Título: `feat(ui): logo, diseño móvil, chat en pantalla y actualización en tiempo real`
> **Qué cambia:** encabezado con el logo 96×96, menú servido por Pug, estilos adaptables a celulares, pantalla de chat y recarga automática de pedidos.
> **Por qué:** la consigna pide navegación sencilla, diseño consistente y adaptable, y la comunicación en tiempo real.
> **Cómo probar:** abrir `/chat` y `/pedidos` en dos navegadores; cambiar un pedido y ver el otro actualizarse sin recargar; reducir el ancho de la ventana.
> **Checklist:** [ ] logo oficial cargado [ ] probado en ancho de celular [ ] sin `innerHTML` con datos de usuarios

**PR de Javier** — Título: `feat: capa de servicios, WebSockets con asistente Gemini e índices, con pruebas`
> **Qué cambia:** reglas de pedidos en `services/`, chat autenticado con Socket.IO, integración con Gemini (clave por `.env`), índices en MongoDB, seed protegido y 65 pruebas (Jest + integración).
> **Por qué:** separar responsabilidades (Rutas → Controladores → Servicios → Modelos), mejorar el rendimiento y comunicar cambios en tiempo real.
> **Cómo probar:** `npm test` (65 aprobadas); en `/chat` escribir `@gemini ¿cuántos pedidos hay pendientes?` (con `GEMINI_API_KEY`).
> **Checklist:** [ ] `GEMINI_API_KEY` solo en `.env` [ ] pruebas en verde [ ] el prompt no incluye datos personales

**PR final** — Título: `release: entrega final v1.1.3 (FreshRoute)`
> Integra las 4 ramas. Evidencia: `npm test` en verde, aplicación desplegada en Render con Atlas, matriz de tecnologías y diagramas en `doc/`.

## 6. Versiones y entrega
- **Etiquetas (tags):** `v1.1.1` (1.ª entrega), `v1.1.2` (2.ª) y `v1.1.3` (3.ª). En GitHub Desktop: *Repository → Create tag*; luego *Releases* en GitHub para descargar cada versión. Así se diferencia la entrega previa de la final.
- **Drive (una carpeta por entrega):** `Primera entrega`, `Segunda entrega`, `Tercera entrega`. Cada una con: código **sin comprimir**, video, PDF y una carpeta `materia de trabajo` (anexos).
- **Campus (cada integrante, individualmente):** el proyecto comprimido en **ZIP / RAR** más el enlace al Drive y a GitHub; los videos **no** se suben al campus, solo el link dentro del PDF. El mismo enlace se publica también en el Foro del grupo.
- **Nombre del PDF:** `DSWB_EntregaFinal_2026_Com2A_Grupo14_Alarcon_Alva_Churquina_Jasque`.
