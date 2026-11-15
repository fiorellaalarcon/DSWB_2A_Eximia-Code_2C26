// ============================================================
// INDEX.JS - PUNTO DE ENTRADA DE LA APLICACION
// ============================================================
// Reemplaza al server.js de la 2da entrega. Orden de arranque:
//  1) Carga las variables de .env (dotenv)
//  2) Verifica que existan las obligatorias (config/env.js)
//  3) Conecta a MongoDB (local o Atlas, segun MONGO_URI)
//  4) Crea UN servidor HTTP compartido por Express y Socket.IO y escucha
// ============================================================
import "dotenv/config"; // debe ir ANTES de usar process.env
import app from "./app.js";
import { conectarDB } from "./config/db.js";
import { validarEntorno } from "./config/env.js";
import { crearServidor } from "./config/servidor.js";

const PORT = process.env.PORT || 3000; // Render asigna el puerto en PORT

try {
  validarEntorno();
  await conectarDB();
  const { server } = crearServidor(app);
  server.listen(PORT, () => console.log(`FreshRoute ejecutandose en el puerto ${PORT}`));
} catch (error) {
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exit(1);
}
