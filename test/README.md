# Pruebas — FreshRoute (entrega final)

Ejecutar: `npm test` (necesita MongoDB encendido; usa `freshroute_test`, que se borra al terminar).
- **Unitarias (Jest, Módulo 13):** `npm run test:unit` — funciones puras, sin base de datos.
- **Integración (`node:test` + `socket.io-client`):** `npm run test:integration` — API, seguridad y WebSockets reales.
La cátedra indica que no es necesario ahondar: se cubren las áreas críticas, con 1–5 pruebas por módulo. Las pruebas manuales con Thunder Client están en la 1ª entrega.

## Unitarias (22)
| Archivo | Qué verifica |
|---|---|
| `unit/reglas.test.js` | Política de contraseña (3 válidas, 6 inválidas) y email con arroba |
| `unit/transiciones.test.js` | Estados finales sin salida; cada rol ve solo sus pasos; Entregado no vuelve a Pendiente |
| `unit/auth.service.test.js` | Hash PBKDF2 con sal (verifica, no es la clave, sal distinta); JWT firma, lleva solo el id y rechaza alteraciones |

## Integración (43)
| Grupo | Qué verifica | Resultado esperado |
|---|---|---|
| Auth (T1–T3) | Login válido sin password; clave incorrecta; API sin sesión | 200 / 401 / 401 |
| Seguridad (S1–S6) | Cookie `httpOnly` y token fuera del cuerpo; clave **hasheada** con sal distinta por usuario; token adulterado y `x-usuario-id` viejo; páginas protegidas (302 a `/login` o `/panel`); usuario dado de baja pierde acceso; logout borra cookie | según cada caso |
| WebSockets (W1–W5) | Sin sesión no conecta; el nombre lo pone el servidor (no se puede suplantar); `@gemini` sin clave avisa; mensajes vacíos/largos se rechazan; aviso `pedido:actualizado` | según cada caso |
| Roles y validaciones (T4–T9e) | Directivo/depósito/planificador sin permiso → 403; body inválido → 400 con lista; política de clave en backend; la **base de datos** rechaza clave débil y email sin `@` aunque se saltee la API; repartidor sin acceso a clientes/productos | 403 / 400 / `ValidationError` |
| Baja lógica (T10–T11) | La baja no borra; el directivo ve inactivos; solo el administrador reactiva; email duplicado → 409 | 200 / 403 / 409 |
| Pedidos (T12–T23) | Sin productos (400); cliente inexistente (404); alta Pendiente con total; transición inválida (409); rol equivocado (403); repartidor obligatorio (400), ocupado (409) y liberado; Entregado no vuelve a Pendiente; Cancelado no se envía; el repartidor ve y cierra solo lo suyo | según cada caso |
| Auditoría (T24) | Los cambios de estado quedan registrados; el depósito no la consulta | 200 / 403 |

Última ejecución: **22 unitarias y 43 de integración aprobadas (65 en total)**.
