// ============================================================
// AUTH.JS (navegador) - usuario logueado, menu y permisos en pantalla
// ============================================================
// Todavia NO hay sesiones ni cookies. Los datos del usuario que
// devolvio el login se guardan en sessionStorage (se borran al
// cerrar la pestana) y api.js envia su id en cada fetch.
// IMPORTANTE: ocultar botones segun el rol es solo comodidad de
// la interfaz; la seguridad real la aplica el SERVIDOR (roles.middleware.js).
// ============================================================
const CLAVE = "freshroute_usuario";

export const guardarUsuario = (u) => sessionStorage.setItem(CLAVE, JSON.stringify(u));
export const obtenerUsuario = () => JSON.parse(sessionStorage.getItem(CLAVE) || "null");
export const cerrarSesion = () => {
  sessionStorage.removeItem(CLAVE);
  location.href = "/login";
};

const MENU = [
  { texto: "Panel", href: "/panel", roles: ["administrador", "administrativo", "deposito", "planificador", "directivo", "repartidor"] },
  { texto: "Clientes", href: "/clientes", roles: ["administrador", "administrativo", "deposito", "planificador", "directivo"] },
  { texto: "Productos", href: "/productos", roles: ["administrador", "administrativo", "deposito", "planificador", "directivo"] },
  { texto: "Repartidores", href: "/repartidores", roles: ["administrador", "administrativo", "deposito", "planificador", "directivo"] },
  { texto: "Pedidos", href: "/pedidos", roles: ["administrador", "administrativo", "deposito", "planificador", "directivo", "repartidor"] }, // el repartidor solo ve los suyos
  { texto: "Usuarios", href: "/usuarios", roles: ["administrador"] },
  { texto: "Auditoria", href: "/auditoria", roles: ["administrador", "directivo"] },
];

// Se llama al inicio de cada pagina privada. Devuelve el usuario.
export function protegerPagina(rolesPermitidos = ["administrador", "administrativo", "deposito", "planificador", "directivo", "repartidor"]) {
  const usuario = obtenerUsuario();
  if (!usuario) {
    location.href = "/login";
    throw new Error("Sin sesion"); // corta la ejecucion del resto del script
  }
  if (!rolesPermitidos.includes(usuario.rol)) {
    location.href = "/panel";
    throw new Error("Sin permiso");
  }
  construirMenu(usuario);
  aplicarRoles(usuario);
  return usuario;
}

function construirMenu(usuario) {
  const nav = document.getElementById("menu");
  nav.replaceChildren(); // idempotente: si protegerPagina() se llama dos veces, el menu NO se duplica
  MENU.filter((m) => m.roles.includes(usuario.rol)).forEach((m) => {
    const a = document.createElement("a");
    a.href = m.href;
    a.textContent = m.texto;
    if (location.pathname === m.href) a.className = "activo";
    nav.append(a);
  });
  const info = document.createElement("span");
  info.className = "usuario-info";
  info.textContent = `${usuario.nombre} (${usuario.rol})`;
  const salir = document.createElement("button");
  salir.textContent = "Salir";
  salir.addEventListener("click", cerrarSesion);
  nav.append(info, salir);
}

// Muestra los elementos con data-roles="rolA,rolB" solo a esos roles.
export function aplicarRoles(usuario) {
  document.querySelectorAll("[data-roles]").forEach((el) => {
    el.hidden = !el.dataset.roles.split(",").includes(usuario.rol);
  });
}
