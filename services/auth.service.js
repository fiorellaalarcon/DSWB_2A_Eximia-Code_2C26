// ============================================================
// SERVICES / AUTH.SERVICE.JS  (NUEVO en la 3ra entrega)
// ============================================================
// Concentra la seguridad de credenciales:
//   - HASH de contrasenas con PBKDF2 + SAL (algoritmo visto en el Bloque 8.0)
//   - JWT firmado (Bloque 10.2) que viaja en una cookie httpOnly (Bloque 10.1)
//
// DECISION: se usa el modulo nativo "crypto" (PBKDF2) como en clase, sin
// agregar bcrypt: cumple el objetivo (hash irreversible con sal unica) sin
// una dependencia extra. bcrypt seria una alternativa equivalente.
// ============================================================
import crypto from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

const pbkdf2 = promisify(crypto.pbkdf2); // version async: no bloquea el servidor mientras calcula
const ITERACIONES = 120000;
const LARGO = 64;
const ALGORITMO = "sha512";

export const NOMBRE_COOKIE = "token";
export const DURACION_MS = 60 * 60 * 1000; // 1 hora

// --- Hash de contrasenas ---------------------------------------------------
export async function crearPasswordSeguro(password) {
  const salt = crypto.randomBytes(16).toString("hex"); // sal unica por usuario
  const hash = (await pbkdf2(password, salt, ITERACIONES, LARGO, ALGORITMO)).toString("hex");
  return { salt, passwordHash: hash };
}

export async function verificarPassword(password, salt, passwordHash) {
  const hash = await pbkdf2(password, salt, ITERACIONES, LARGO, ALGORITMO);
  const guardado = Buffer.from(passwordHash, "hex");
  // timingSafeEqual: compara en tiempo constante (evita ataques de temporizacion)
  return hash.length === guardado.length && crypto.timingSafeEqual(hash, guardado);
}

// --- JWT --------------------------------------------------------------------
// El token lleva SOLO el id. El ROL se lee siempre de MongoDB en cada solicitud,
// asi un cambio de rol o una baja tienen efecto inmediato (el token no queda "viejo").
export const firmarToken = (usuario) =>
  jwt.sign({ id: String(usuario._id) }, process.env.JWT_SECRET, { expiresIn: "1h" });

export function verificarToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Sesion invalida o vencida. Inicie sesion nuevamente.", 401);
  }
}

// Opciones de la cookie: httpOnly (JS del navegador no puede leerla -> protege del XSS),
// sameSite (mitiga CSRF) y secure en produccion (solo viaja por HTTPS).
export const opcionesCookie = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: DURACION_MS,
});
