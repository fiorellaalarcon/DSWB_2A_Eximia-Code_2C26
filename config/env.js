// ============================================================
// CONFIG / ENV.JS  (NUEVO en la 3ra entrega)
// ============================================================
// Verifica al ARRANCAR que existan las variables de entorno obligatorias.
// "Fallar rapido" evita descubrir en produccion (Render) que falta un
// secreto. Los secretos NUNCA van escritos en el codigo (ver .env.example).
// ============================================================
const OBLIGATORIAS = ["MONGO_URI", "JWT_SECRET"];

export function validarEntorno() {
  const faltantes = OBLIGATORIAS.filter((nombre) => !process.env[nombre]);
  if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno obligatorias: ${faltantes.join(", ")}. Revise el archivo .env (ver .env.example).`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET es demasiado corto (minimo 32 caracteres). Genere uno con: npm run secret");
  }
}

export const esProduccion = () => process.env.NODE_ENV === "production";
