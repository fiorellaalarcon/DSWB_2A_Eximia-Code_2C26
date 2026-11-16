# FreshRoute — Eximia Code (Entrega final · v1.1.3)
# Desarrollo de Sistemas Web (Back End) — 2° A — 2C2026 · Caso 2: Distribución de Pedidos “FreshRoute”

•	Carpeta Drive: 
https://drive.google.com/drive/folders/1DIdFfikiBLpY_M7adQ7gS02nxS6y_cJL?usp=sharing

•	GitHub: 
https://github.com/fiorellaalarcon/DSWB_2A_Eximia-Code_2C26

•	Link al Video de las entregas:
1° parcial: https://drive.google.com/file/d/13FJ2l6Ig-kQTDpDHzRFaP_HdFP51kCij/view?usp=sharing
2° parcial: https://drive.google.com/file/d/1IhBv8rT4i2CVdOwhDH4SutLOmAwW8mAm/view?usp=sharing
3° parcial: 

### Integrantes
- Alarcón, Fiorella Melina
- Alva, Axel Roni
- Churquina, Javier
- Jasque Cano, Malena Concepción

Backend (Node.js + Express + MongoDB Atlas) con interfaz Pug para registrar clientes, productos, repartidores y pedidos, controlar el estado de cada entrega y avisar los cambios **en tiempo real**, con un asistente de IA en el chat de operaciones.

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


## Evolución del proyecto
| Versión | Entrega | Qué trajo |
|---|---|---|
| v1.1.1 | 1ª | Node + Express + Pug, MVC, persistencia en archivos JSON |
| v1.1.2 | 2ª | ES Modules, MongoDB + Mongoose, 6 roles, validaciones en 3 capas, Fetch, baja lógica y auditoría |
| **v1.1.3** | **3ª (final)** | **Hash PBKDF2, JWT en cookie, MongoDB Atlas, Render, Socket.IO, chat con Gemini, capa de Servicios, Jest, mejoras de frontend** |

Detalle en `doc/MATRIZ_TECNOLOGIAS.md` (matriz de las tres entregas), `doc/DIAGRAMAS.md`, `doc/CAMBIOS_API.md`, `doc/alcance.md` y `doc/DESPLIEGUE.md`.

## Requisitos previos
Node.js 20 o superior · npm · MongoDB (local con **Compass** para desarrollar, o una cuenta en **MongoDB Atlas**) · opcional: clave de **Google AI Studio** para el asistente.

## Instalación y ejecución local
```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run secret              # genera un secreto: pegarlo en JWT_SECRET del .env
npm run seed                # datos de ejemplo y usuarios de prueba
npm run dev                 # o: npm start  ->  http://localhost:3000
npm test                    # unitarias (Jest) + integración (node:test)
```
Variables del `.env` (ver `.env.example`): `PORT`, `NODE_ENV`, `MONGO_URI`, `MONGO_URI_TEST`, `JWT_SECRET` (obligatoria, 32+ caracteres), `GEMINI_API_KEY` y `GEMINI_MODEL` (opcionales). Si falta una obligatoria, la app no arranca y lo explica.

**Con Atlas:** pegar la cadena `mongodb+srv://...` en `MONGO_URI`. El seed borra datos, por eso contra Atlas exige confirmación: `npm run seed -- --force`.
**Desplegar en Render:** paso a paso en `doc/DESPLIEGUE.md`.

## Usuarios de prueba
| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin.123` | administrador de sistemas |
| `administrativo` | `Oficina.123` | administrativo (oficina) |
| `deposito` | `Deposito.123` | operador de depósito |
| `planificador` | `Planif.123` | planificador de rutas |
| `directivo` | `Direct.123` | directivo |
| `repartidor1` | `Repa.1234` | repartidor (Carlos Pérez, con un pedido En camino) |
| `repartidor2` | `Repa.5678` | repartidor (Lucía Gómez) |

Las contraseñas se guardan **hasheadas** (PBKDF2 + sal); estas son solo las claves para ingresar. Política: 8+ caracteres con mayúsculas, minúsculas y un carácter especial.

## Roles y quién hace cada cambio de estado
| Rol | Puede |
|---|---|
| `administrativo` | Clientes y productos; crear/editar pedidos Pendientes; cancelar Pendiente o Preparado |
| `deposito` | Pendiente → Preparado |
| `planificador` | Repartidores; Preparado → En camino (con repartidor disponible); cancelar Preparado o En camino |
| `repartidor` | Ver **solo sus pedidos** y confirmar En camino → Entregado |
| `directivo` | Solo lectura, historial (inactivos) y auditoría |
| `administrador` | Usuarios, reactivaciones, historial y auditoría |

Paso inexistente → 409 · paso de otro rol → 403. Todos los roles usan el **Chat**.

## Seguridad (qué hace y por qué)
- **Hash PBKDF2 + sal única** (`services/auth.service.js`); `timingSafeEqual` al comparar. Nunca se devuelve el hash.
- **JWT firmado** (solo lleva el `id`) en **cookie `httpOnly`** (`sameSite=lax`, `secure` en producción). El **rol se lee de la base** en cada solicitud: un cambio de rol o una baja tienen efecto inmediato.
- **Autorización** por rol en cada ruta (`permitirRoles`/`denegarRoles`) y por transición; las **páginas** también se protegen en el servidor.
- Validación en tres capas (`public/js/reglas.js`), secretos en `.env`, `/api` con tope de tamaño de body y errores sin detalles internos.
- WebSockets: solo conectan usuarios con JWT válido; el nombre lo pone el servidor; mensajes de hasta 500 caracteres y espera entre consultas a la IA.

## Chat y asistente de IA
Página `/chat`. Escribir `@gemini <pregunta>` consulta al asistente (prompt en `prompts/asistente-freshroute.txt`, datos reales de cantidades por estado, sin datos personales). Sin `GEMINI_API_KEY` el chat funciona y el asistente avisa que no está configurado.

## Estructura (MVC + Servicios)
```
index.js              punto de entrada: .env, base de datos, servidor HTTP + Socket.IO
app.js                configuración de Express (middlewares, vistas, API)
config/               db.js (Atlas/local), env.js, servidor.js, menu.js
models/               esquemas Mongoose (Usuario, Cliente, Producto, Repartidor, Pedido, Auditoria)
controllers/          coordinan entrada y respuesta (crud.factory.js evita repetir el CRUD)
services/             reglas de negocio: pedidos, auth, auditoría, contexto y Gemini
routes/               endpoints y vistas; cada ruta declara sus roles
middlewares/          auth (JWT), roles, validaciones, errores, logger
sockets/              chatSocket.js (Socket.IO)
prompts/              instrucciones del asistente de IA
views/ + public/      plantillas Pug, CSS, JavaScript del navegador y logo
scripts/seed.js       datos iniciales
test/                 unit (Jest) e integration (node:test) + README
doc/                  alcance, matriz de tecnologías, diagramas, cambios de la API y despliegue
```

## API (resumen)
| Recurso | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/yo` |
| Clientes / Productos / Repartidores | `GET /` (`?nombre=`, `?disponible=`, `?incluirInactivos=true`), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (baja lógica), `PATCH /:id/reactivar` |
| Pedidos | `GET /` (`?cliente=&estado=`), `GET /:id`, `POST /`, `PUT /:id` (solo Pendiente), `PATCH /:id/estado` |
| Usuarios (admin) | CRUD + baja + reactivar |
| Auditoría | `GET /api/auditoria?entidad=&accion=&limite=` |
| Salud | `GET /health` |

Códigos: 200/201 · 400 datos inválidos · 401 sin sesión · 403 sin permiso · 404 no existe · 409 regla de negocio · 500 interno.

## Pruebas
`npm test` ejecuta 22 pruebas **unitarias** (Jest: reglas, transiciones, hash y JWT) y 43 de **integración** (`node:test`: API, seguridad, roles, pedidos y WebSockets) sobre la base `freshroute_test`. Detalle en `test/README.md`.

## Limitaciones conocidas
Plan gratuito de Render con arranque en frío · red de Atlas abierta (`0.0.0.0/0`) · historial del chat en memoria · JWT de 1 hora sin refresco · el asistente depende de un servicio externo. Más en `doc/alcance.md`.

## Colaboración
Ramas, commits convencionales y Pull Requests: `CONTRIBUTING.md`.

## Declaración de uso de IA

### Herramienta utilizada

Se utilizó Claude Sonnet 5.5 (Anthropic) como herramienta de asistencia durante el desarrollo de las tres entregas de FreshRoute. En la tercera entrega, su uso estuvo orientado principalmente a analizar la evolución del proyecto, revisar el código de las etapas anteriores, evaluar alternativas técnicas y obtener propuestas iniciales de implementación y documentación.

La asistencia se aplicó a distintos aspectos del desarrollo: incorporación del hash de contraseñas mediante PBKDF2 con sal, autenticación mediante JWT y cookies `httpOnly`, asistencia en la configuración de MongoDB Atlas y Render, implementación de Socket.IO y del asistente de IA, separación de las reglas de negocio en una capa de Servicios, elaboración de pruebas automáticas y mejoras de la interfaz. También se utilizó como apoyo para preparar en un formato markdown la matriz de tecnologías, los diagramas, la documentación técnica, el guion de exposición y el plan de commits y Pull Requests.

### Aplicación y revisión por parte del equipo

Las propuestas generadas por la IA fueron revisadas, probadas y adaptadas por el equipo de acuerdo con los requisitos del caso FreshRoute, los contenidos de la materia y las decisiones de arquitectura del proyecto. La IA no determinó por sí sola las reglas de negocio, los permisos de los seis roles ni las transiciones de estado de los pedidos, sino que fueron decisiones del equipo al analizar el caso tanto Ingeniería de Sodtware con el alcance dado en Backend conforme las consignas y sugerencias dadas en las clases.

Para verificar el funcionamiento se ejecutaron pruebas automáticas con `npm test`: 22 pruebas unitarias y 43 de integración, con un resultado de 65 pruebas aprobadas. También se realizaron recorridos manuales y se corrigieron errores detectados durante el desarrollo, incluyendo problemas en pruebas, en la visualización del menú y en archivos del navegador.

El equipo revisó las decisiones técnicas, la integración de las ramas y los resultados de las pruebas mediante Pull Requests. Cada integrante asumió responsabilidades sobre los módulos asignados y participó en la integración del sistema. La documentación también fue revisada y adaptada para describir las funcionalidades implementadas, las decisiones adoptadas y las limitaciones conocidas, con las capturas correspondientes.

### IA integrada en la aplicación

Además de la asistencia utilizada durante el desarrollo, FreshRoute incorpora Gemini mediante su API como funcionalidad del producto. El asistente está disponible en el chat interno y permite realizar consultas sobre información operativa agregada, como las cantidades de pedidos según su estado.

Esta integración es independiente del uso de IA como herramienta de desarrollo. Su comportamiento está definido por un prompt propio, que establece el rol del asistente, el tipo de información que puede utilizar y las restricciones para evitar respuestas inventadas o solicitudes de datos sensibles. La conexión real depende de la configuración de `GEMINI_API_KEY` y de la disponibilidad del servicio.

# Prompts de IA · Logo

Este documento registra los prompts utilizados como apoyo en la generación y revisión del recurso visual del proyecto. La IA se utilizó como herramienta asistida: el equipo seleccionó, revisó y adaptó los resultados antes de incorporarlos al sitio.
- IA utilizada, modelo:
- **Google AI Studio (Gemini 3.1 Flash Image / Nano Banana 2) para recursos visuales.**. 
- **Plan:** gratuito.
Se utilizó para:
- Generar la imagen del logo.

> **Criterio de autoría:** un recurso generado con IA no se incorporó automáticamente. Se evaluaron coherencia visual, legibilidad, relación con la identidad de Eximia Code, adaptación al tamaño de uso y consistencia entre páginas.


## Prompt base para el logo

> Diseñar un logo profesional y minimalista para un equipo ficticio de desarrollo de software llamado “Eximia Code”. La identidad debe combinar tecnología, software, datos, logística inteligente, planificación de rutas y trazabilidad B2B. Crear un símbolo de X simple, geométrico y reconocible a tamaño pequeño. Estética tecnológica corporativa, moderna y sobria, sin apariencia infantil, con formas limpias y buena legibilidad. 
>La propuesta debe funcionar tanto sobre fondo claro como sobre fondo oscuro y mantener una identidad visual coherente para un sitio web académico.Colores sugeridos: Utilizar una paleta tecnológica y corporativa, preferentemente basada en: azul oscuro o azul petróleo, asociado con confianza y tecnología; verde o turquesa como color de acento, asociado con eficiencia, movimiento y trazabilidad; blanco o gris claro para contraste. 
>También puede incorporarse un tono oscuro neutro para reforzar la identidad profesional.  paleta debe ser sobria, moderna y armónica, adecuada para una empresa de software B2B.Composición: Crear un isotipo compacto que combine visualmente una ruta, nodos de conexión y un punto de destino, integrado con algún detalle sutil de código.


## 5. Revisión posterior a la generación

Después de generar los recursos, el equipo revisó:
- coherencia con el concepto de Eximia Code;
- legibilidad del logo en tamaños pequeños;
- consistencia visual.
- comportamiento sobre fondo claro y oscuro;
- peso y dimensiones antes de convertir los recursos a WebP;
- En el logo se agregó un borde blanco y se quitó el fondo, con Microsft Paint.

## 6. Uso responsable de IA
La IA se utilizó como apoyo para explorar alternativas y acelerar tareas de diseño/revisión. La decisión final sobre qué recurso utilizar, cómo integrarlo, qué textos conservar y qué modificaciones realizar correspondió al equipo.


### Referencias y recursos externos

- **Claude (Anthropic):** https://claude.ai/
- **Repositorio del proyecto:** https://github.com/fiorellaalarcon/DSWB_2A_Eximia-Code_2C26
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Mongoose:** https://mongoosejs.com/docs/
- **Express:** https://expressjs.com/
- **Node.js:** https://nodejs.org/docs/
- **Render:** https://render.com/docs
- **Socket.IO:** https://socket.io/docs/v4/
- **Gemini API:** https://ai.google.dev/gemini-api/docs
- **Jest:** https://jestjs.io/docs/getting-started
- **OWASP – Password Storage Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

La IA se utilizó como herramienta de apoyo y no como sustituto del trabajo del equipo. Las decisiones de implementación, la revisión del código, las pruebas, la integración y la responsabilidad sobre el resultado final corresponden a los integrantes de Eximia Code.