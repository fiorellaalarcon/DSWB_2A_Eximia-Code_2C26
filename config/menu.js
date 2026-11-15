// ============================================================
// CONFIG / MENU.JS (NUEVO)
// ============================================================
// Menu de navegacion declarado UNA vez. El servidor lo filtra segun el rol
// y Pug lo dibuja ya filtrado (antes lo armaba JavaScript en el navegador).
// ============================================================
const TODOS = ["administrador", "administrativo", "deposito", "planificador", "directivo", "repartidor"];
const SIN_REPARTIDOR = TODOS.filter((r) => r !== "repartidor");

export const MENU = [
  { texto: "Panel", href: "/panel", roles: TODOS },
  { texto: "Clientes", href: "/clientes", roles: SIN_REPARTIDOR },
  { texto: "Productos", href: "/productos", roles: SIN_REPARTIDOR },
  { texto: "Repartidores", href: "/repartidores", roles: SIN_REPARTIDOR },
  { texto: "Pedidos", href: "/pedidos", roles: TODOS },
  { texto: "Chat", href: "/chat", roles: TODOS },
  { texto: "Usuarios", href: "/usuarios", roles: ["administrador"] },
  { texto: "Auditoria", href: "/auditoria", roles: ["administrador", "directivo"] },
];

export const menuParaRol = (rol) => MENU.filter((item) => item.roles.includes(rol));
