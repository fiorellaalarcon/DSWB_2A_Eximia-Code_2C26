// ============================================================
// SERVER.JS - PUNTO DE ENTRADA
// ============================================================
// 1) Carga las variables del archivo .env (dotenv)
// 2) Conecta a MongoDB (config/db.js)
// 3) Recien entonces pone a escuchar el servidor
// ============================================================
import "dotenv/config"; // debe ir ANTES de usar process.env
import app from "./app.js";
import { conectarDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

await conectarDB(); // top-level await (visto en D3): solo en modulos ES
app.listen(PORT, () => console.log(`FreshRoute ejecutandose en http://localhost:${PORT}`));
