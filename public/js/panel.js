import { protegerPagina } from "./auth.js";
import { el } from "./ui.js";

const usuario = protegerPagina();

document.getElementById("bienvenida").textContent = `Hola ${usuario.nombre}. Su rol es: ${usuario.rol}.`;

// Cada rol representa a una persona real de FreshRoute (ver documentacion).
const PERMISOS = {
  administrativo: ["Administrar clientes y productos (alta, edicion, baja)", "Crear y editar pedidos mientras estan Pendientes", "Cancelar pedidos Pendientes o Preparados", "No prepara ni despacha"],
  deposito: ["Preparar pedidos: Pendiente → Preparado", "Consultar clientes, productos y pedidos", "No crea pedidos ni despacha"],
  planificador: ["Administrar repartidores", "Despachar: Preparado → En camino (solo con repartidor disponible)", "Cancelar pedidos en ruta", "No confirma entregas (las confirma el repartidor), ni crea ni prepara pedidos"],
  repartidor: ["Ver solo los pedidos que tiene asignados, con la direccion de entrega", "Confirmar la entrega: En camino → Entregado, solo en sus pedidos", "No ve clientes, productos ni pedidos de otros repartidores"],
  directivo: ["Consultar toda la informacion (solo lectura)", "Ver registros inactivos (historial) y la auditoria", "No puede crear ni modificar nada"],
  administrador: ["Gestionar usuarios (alta, edicion, baja, reactivacion)", "Reactivar clientes, productos y repartidores", "Ver registros inactivos y la auditoria", "No opera pedidos (minimo privilegio)"],
};
document.getElementById("permisos").append(...PERMISOS[usuario.rol].map((t) => el("li", { textContent: t })));
