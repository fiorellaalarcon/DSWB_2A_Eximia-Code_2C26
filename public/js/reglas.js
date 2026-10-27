// ============================================================
// REGLAS.JS - FUENTE UNICA DE LAS REGLAS DE VALIDACION
// ============================================================
// Este archivo lo importan LAS TRES CAPAS, asi las reglas no pueden
// contradecirse entre si:
//   1) FRONTEND  -> public/js/validaciones.js (antes de enviar el fetch)
//   2) BACKEND   -> middlewares/validaciones.middleware.js (antes del controlador)
//   3) BASE DE DATOS -> esquemas de Mongoose en models/ (antes de guardar)
// No usa nada del navegador ni de Node: es JavaScript puro.
//
// NOTA: la contrasena se valida en TEXTO PLANO porque todavia no hay hash
// (limitacion documentada). Al incorporar bcrypt, la regla se aplica ANTES de
// hashear y el esquema guardaria el hash.
// ============================================================

// El email debe tener forma texto@dominio.ext (lleva arroba).
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MENSAJE_EMAIL = "El email es obligatorio y debe tener formato válido (con @ y dominio).";
export const MENSAJE_PASSWORD =
  "La contraseña debe tener al menos 8 caracteres, con mayúsculas, minúsculas y un carácter especial (por ejemplo . , ; ! _ -).";

// Devuelve null si el texto es valido, o el mensaje de error.
export function errorEmail(valor) {
  return typeof valor === "string" && REGEX_EMAIL.test(valor.trim()) ? null : MENSAJE_EMAIL;
}

export function errorPassword(valor) {
  const valida =
    typeof valor === "string" &&
    valor.length >= 8 &&
    /\p{Lu}/u.test(valor) && // al menos una mayuscula
    /\p{Ll}/u.test(valor) && // al menos una minuscula
    /[^\p{L}\p{N}\s]/u.test(valor); // al menos un caracter especial (ni letra, ni numero, ni espacio)
  return valida ? null : MENSAJE_PASSWORD;
}