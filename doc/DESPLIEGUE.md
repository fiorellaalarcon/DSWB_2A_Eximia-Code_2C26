# Despliegue: MongoDB Atlas + Render

## ¿Render o Vercel? Decisión: **Render**
| Criterio | Render | Vercel |
|---|---|---|
| Tipo de aplicación | Servidor Node **persistente** (Express tal cual) | Funciones **serverless** (se crean y destruyen por solicitud) |
| WebSockets / Socket.IO | Sí: la conexión se mantiene abierta | No es el modelo adecuado: las funciones serverless no sostienen conexiones persistentes |
| Cambios al código | Ninguno: `npm install` y `npm start` | Habría que adaptar la app a funciones |
| Despliegue automático desde GitHub | Sí | Sí |
| Plan gratuito | Sí, con límites: el servicio se **duerme tras ~15 min sin uso** y el primer acceso tarda (~30–60 s) | Sí |
| Lo que dice la teoría (Bloque 9.0) | Backend en Render | Pensado para frontend |

**Conclusión:** FreshRoute usa Socket.IO (chat y avisos en tiempo real), por lo que necesita un servidor siempre activo: **Render**. Los límites del plan gratuito pueden cambiar: verificarlos en la web de Render antes de la defensa. Para evitar el "arranque en frío" durante el video, abrir la URL unos minutos antes.

## Paso 1 — MongoDB Atlas
1. Crear cuenta en https://www.mongodb.com/cloud/atlas y un **proyecto** (ej.: `FreshRoute`).
2. **Create a deployment** → plan gratuito **M0** → elegir proveedor y la región más cercana (ej.: São Paulo si está disponible) → *Create*.
3. **Database Access** → *Add New Database User*: usuario `freshroute_app`, contraseña autogenerada (**guardarla**) y permisos *Read and write* **solo sobre la base `freshroute`** (mínimo privilegio, en lugar de "any database").
4. **Network Access** → *Add IP Address* → `0.0.0.0/0` (cualquier IP). Es necesario porque Render usa IPs dinámicas; se compensa con una contraseña fuerte. No usar este permiso para datos reales sensibles.
5. **Connect** → *Drivers* → copiar la cadena `mongodb+srv://...`. Reemplazar `<password>` por la contraseña (si tiene caracteres especiales como `@` o `#`, codificarlos: `@`→`%40`, `#`→`%23`) y agregar el nombre de la base antes del `?`:
   `mongodb+srv://freshroute_app:CLAVE@cluster0.xxxxx.mongodb.net/freshroute?retryWrites=true&w=majority`
6. Probar en la computadora: pegar esa cadena en `MONGO_URI` del `.env`, ejecutar `npm run seed -- --force` y `npm run dev`. En **Compass** (*New connection*) usar la misma cadena y verificar que aparezcan las colecciones.

## Paso 2 — Subir el código a GitHub
`.env` y `node_modules/` **no** se suben (están en `.gitignore`). Verificar con `git status`. Subir a `main` (ver `CONTRIBUTING.md`).

## Paso 3 — Render
1. Crear cuenta en https://render.com con *Sign up with GitHub* y autorizar el repositorio.
2. **New +** → **Web Service** → elegir el repositorio `DSWB_2A_Eximia-Code_2C26` → *Connect*.
3. Configurar:
   - **Name:** `freshroute` · **Region:** la más cercana disponible · **Branch:** `main`
   - **Runtime:** Node · **Build Command:** `npm install` · **Start Command:** `npm start`
   - **Instance Type:** Free
4. **Environment Variables** (*Add*):
   | Variable | Valor |
   |---|---|
   | `NODE_ENV` | `production` (activa la cookie `secure`) |
   | `MONGO_URI` | la cadena de Atlas del Paso 1 |
   | `JWT_SECRET` | un secreto largo distinto del local (`npm run secret`) |
   | `GEMINI_API_KEY` | la clave de Google AI Studio (si no se carga, el chat funciona pero `@gemini` avisa que no está configurado) |
   | `GEMINI_MODEL` | `gemini-2.5-flash` (o el modelo vigente) |
5. **Advanced** → **Health Check Path:** `/health`.
6. **Create Web Service**. En *Logs* debe verse `MongoDB conectado: freshroute` y `FreshRoute ejecutandose en el puerto ...`. La URL queda como `https://freshroute-xxxx.onrender.com`.
7. Cargar los usuarios de prueba **desde la computadora** (el plan gratuito no ofrece terminal): `npm run seed -- --force` con la `MONGO_URI` de Atlas en el `.env`.

## Paso 4 — Verificación
1. Abrir `https://<tu-app>.onrender.com/health` → `{"estado":"ok"}`.
2. Iniciar sesión con un usuario de prueba y recorrer Pedidos y Chat (dos navegadores: el cambio de un pedido se ve en el otro sin recargar).
3. En Atlas → *Browse Collections*: ver `usuarios` (con `passwordHash` y `salt`, nunca la clave), `pedidos` y `auditorias`.
4. Cada `git push` a `main` redespliega automáticamente (CI/CD básico de la teoría).

## Problemas frecuentes
| Síntoma | Causa y solución |
|---|---|
| `MongoServerSelectionError` | Falta `0.0.0.0/0` en *Network Access*, o la clave/URI está mal escrita |
| `Faltan variables de entorno obligatorias` | Cargar `MONGO_URI` y `JWT_SECRET` en Render |
| Login funciona en local pero no en Render | Falta `NODE_ENV=production` o se está entrando por `http` en lugar de `https` |
| La primera carga tarda | El plan gratuito "durmió" el servicio: esperar ~1 minuto |
| El chat no responde a `@gemini` | Falta `GEMINI_API_KEY` o el modelo no está vigente: revisar `GEMINI_MODEL` |
