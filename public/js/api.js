// ============================================================
// API.JS (navegador) - envoltorio de fetch()
// ============================================================
// Centraliza: encabezado JSON, id de usuario, y el manejo de
// respuestas HTTP. fetch() NO lanza error con un 400/404/409/500
// (solo si falla la red), por eso se revisa res.ok a mano.
// ============================================================
import { obtenerUsuario, cerrarSesion } from "./auth.js";

export class ErrorApi extends Error {
  constructor(mensaje, status, errores) {
    super(mensaje);
    this.status = status;
    this.errores = errores || [];
  }
}

async function pedir(metodo, url, cuerpo) {
  const usuario = obtenerUsuario();
  let res;
  try {
    res = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        ...(usuario && { "x-usuario-id": usuario.id }),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    // Error de red: el servidor no respondio.
    throw new ErrorApi("No se pudo conectar con el servidor.", 0);
  }

  const datos = await res.json().catch(() => ({})); // por si la respuesta no trae JSON

  if (!res.ok) {
    // 401 fuera del login = usuario inexistente/dado de baja -> volver a ingresar.
    if (res.status === 401 && !url.includes("/api/auth/login")) cerrarSesion();
    throw new ErrorApi(datos.error || "Error inesperado.", res.status, datos.errores);
  }
  return datos;
}

export const api = {
  get: (url) => pedir("GET", url),
  post: (url, cuerpo) => pedir("POST", url, cuerpo),
  put: (url, cuerpo) => pedir("PUT", url, cuerpo),
  patch: (url, cuerpo) => pedir("PATCH", url, cuerpo ?? {}),
  delete: (url) => pedir("DELETE", url),
};