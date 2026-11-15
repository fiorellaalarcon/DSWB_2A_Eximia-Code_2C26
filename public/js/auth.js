// ============================================================
// AUTH.JS (navegador)  (CAMBIA en la 3ra entrega)
// ============================================================
// 2da entrega: el usuario se guardaba en sessionStorage y se enviaba su id en
// cada fetch. 3ra entrega: la sesion es una COOKIE httpOnly con un JWT que el
// navegador envia solo (JavaScript no puede leerla). Los datos para mostrar
// (nombre y rol) los escribe el SERVIDOR en <body data-...> (ver layout.pug).
// IMPORTANTE: ocultar botones segun el rol es comodidad; la seguridad real la
// aplica el servidor (protegerVista, identificarUsuario y permitirRoles).
// ============================================================
const TODOS = ["administrador", "administrativo", "deposito", "planificador", "directivo", "repartidor"];

export function obtenerUsuario() {
  const { usuarioId, nombre, rol } = document.body.dataset;
  return rol ? { id: usuarioId, nombre, rol } : null;
}

// Cierra la sesion: el servidor borra la cookie y se vuelve al login.
export async function cerrarSesion() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    location.href = "/login";
  }
}

// Verificacion de comodidad al inicio de cada pagina (el servidor ya la protege).
export function protegerPagina(rolesPermitidos = TODOS) {
  const usuario = obtenerUsuario();
  if (!usuario) {
    location.href = "/login";
    throw new Error("Sin sesion");
  }
  if (!rolesPermitidos.includes(usuario.rol)) {
    location.href = "/panel";
    throw new Error("Sin permiso");
  }
  aplicarRoles(usuario);
  return usuario;
}

// Muestra los elementos con data-roles="rolA,rolB" solo a esos roles.
export function aplicarRoles(usuario) {
  document.querySelectorAll("[data-roles]").forEach((el) => {
    el.hidden = !el.dataset.roles.split(",").includes(usuario.rol);
  });
}
