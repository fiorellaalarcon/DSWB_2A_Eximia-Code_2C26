// ============================================================
// PEDIDOS.JS (navegador)
// ============================================================
// Formulario de alta/edicion con filas dinamicas de productos,
// filtros por estado y cliente (query params), cambio de estado
// y despacho con repartidor disponible. Todo con fetch, sin recargar.
// ============================================================
import { api } from "./api.js";
import { protegerPagina } from "./auth.js";
import { el, mostrarMensaje, mostrarErrores, limpiarErrores, formatearFecha, formatearPesos } from "./ui.js";

const usuario = protegerPagina();
// Que ve cada rol en pantalla (el servidor igual lo valida):
const puedeCrear = usuario.rol === "administrativo"; // alta / edicion de pedidos
const esPlanificador = usuario.rol === "planificador"; // elige repartidor al despachar
const esRepartidor = usuario.rol === "repartidor"; // chofer: solo ve sus pedidos, sin acceso a clientes/productos

const form = document.getElementById("formulario");
const tabla = document.getElementById("tabla");
const contItems = document.getElementById("items");
const selCliente = document.getElementById("cliente");
const filtroEstado = document.getElementById("filtroEstado");
const filtroCliente = document.getElementById("filtroCliente");
const selRepartidor = document.getElementById("repartidorDespacho");

let editandoId = null; // null = alta | id = edicion (mismo patron que la clase)
let productos = []; // catalogo para los <select> de cada fila

// ---------- carga de datos auxiliares ----------
async function cargarCatalogos() {
  if (esRepartidor) return; // no tiene permiso sobre clientes ni productos (el servidor responderia 403)
  const [clientes, prods] = await Promise.all([api.get("/api/clientes"), api.get("/api/productos")]);
  productos = prods;
  const opciones = (lista) => lista.map((c) => el("option", { value: c._id, textContent: c.nombre }));
  selCliente.replaceChildren(el("option", { value: "", textContent: "Seleccione..." }), ...opciones(clientes));
  filtroCliente.replaceChildren(el("option", { value: "", textContent: "Todos" }), ...opciones(clientes));
  if (esPlanificador) await cargarRepartidores();
}

// Solo repartidores DISPONIBLES (regla de negocio del caso).
async function cargarRepartidores() {
  const reps = await api.get("/api/repartidores?disponible=true");
  selRepartidor.replaceChildren(
    el("option", { value: "", textContent: reps.length ? "Seleccione..." : "(ninguno disponible)" }),
    ...reps.map((r) => el("option", { value: r._id, textContent: `${r.nombre} ${r.patente ? `- ${r.patente}` : ""}` }))
  );
}

// ---------- filas dinamicas de productos ----------
function agregarFila(productoId = "", cantidad = 1) {
  const select = el("select", { name: "producto" }, el("option", { value: "", textContent: "Producto..." }),
    ...productos.map((p) => el("option", { value: p._id, textContent: `${p.nombre} (${formatearPesos(p.precio)})` })));
  select.value = productoId;
  const inputCantidad = el("input", { type: "number", name: "cantidad", min: 1, step: 1, value: cantidad });
  const quitar = el("button", { type: "button", textContent: "Quitar", onclick: () => fila.remove() });
  const fila = el("div", { className: "fila-item" }, select, inputCantidad, quitar);
  contItems.append(fila);
}
document.getElementById("btnAgregarItem")?.addEventListener("click", () => agregarFila());

// ---------- consulta con filtros (query params) ----------
async function cargar() {
  const params = new URLSearchParams();
  if (filtroEstado.value) params.set("estado", filtroEstado.value);
  if (filtroCliente.value) params.set("cliente", filtroCliente.value);
  try {
    dibujarTabla(await api.get(`/api/pedidos?${params}`));
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

function dibujarTabla(pedidos) {
  tabla.replaceChildren();
  if (pedidos.length === 0) {
    tabla.append(el("tr", {}, el("td", { colSpan: 7, textContent: "Sin pedidos." })));
    return;
  }
  for (const p of pedidos) {
    const resumen = p.items.map((i) => `${i.cantidad} x ${i.producto?.nombre ?? "?"}`).join(", ");
    const historial = el("details", {}, el("summary", { textContent: "Historial" }),
      ...p.historialEstados.map((h) => el("div", { textContent: `${formatearFecha(h.fecha)} - ${h.estado}` })));

    const acciones = el("td", { className: "acciones" }, historial);
    if (puedeCrear && p.estado === "Pendiente") acciones.append(el("button", { textContent: "Modificar", onclick: () => editar(p) }));
    // Solo botones de pasos validos Y permitidos para ESTE rol (la lista viene filtrada del backend):
    // deposito ve "→ Preparado"; planificador ve "→ En camino / Entregado"; administrativo ve "→ Cancelado".
    p.siguientesEstados.forEach((estado) =>
      acciones.append(el("button", { className: estado === "Cancelado" ? "peligro" : "", textContent: `→ ${estado}`, onclick: () => cambiarEstado(p, estado) })));

    tabla.append(el("tr", {},
      // Cliente y direccion de entrega (util para el repartidor).
      el("td", {}, el("strong", { textContent: p.cliente?.nombre ?? "?" }), el("br"), el("small", { textContent: p.cliente?.direccion ?? "" })),
      el("td", { textContent: resumen }),
      el("td", { textContent: formatearPesos(p.total) }),
      el("td", {}, el("span", { className: `etiqueta estado-${p.estado.replace(" ", "")}`, textContent: p.estado })),
      el("td", { textContent: p.repartidor?.nombre ?? "-" }),
      el("td", { textContent: formatearFecha(p.updatedAt) }),
      acciones));
  }
}

// ---------- alta / edicion ----------
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarErrores();
  const items = [...contItems.children].map((fila) => ({
    producto: fila.querySelector("[name=producto]").value,
    cantidad: Number(fila.querySelector("[name=cantidad]").value),
  }));
  const datos = { cliente: selCliente.value, items };

  // CAPA 1 (frontend): mismas reglas que el middleware validarPedido.
  const erroresFront = [];
  if (!datos.cliente) erroresFront.push({ campo: "cliente", mensaje: "Seleccione un cliente." });
  if (items.length === 0) erroresFront.push({ campo: "items", mensaje: "Agregue al menos un producto." });
  items.forEach((i, n) => {
    if (!i.producto) erroresFront.push({ campo: "producto", mensaje: `Producto ${n + 1}: seleccione un producto.` });
    if (!Number.isInteger(i.cantidad) || i.cantidad < 1) erroresFront.push({ campo: "cantidad", mensaje: `Producto ${n + 1}: la cantidad debe ser un entero mayor a cero.` });
  });
  if (erroresFront.length > 0) {
    mostrarErrores(erroresFront);
    return mostrarMensaje("Revise los datos del pedido.", "error");
  }
  try {
    if (editandoId) await api.put(`/api/pedidos/${editandoId}`, datos);
    else await api.post("/api/pedidos", datos);
    mostrarMensaje(editandoId ? "Pedido actualizado correctamente." : "Pedido creado correctamente.");
    salirDeEdicion();
    await cargar();
  } catch (error) {
    mostrarErrores(error.errores);
    mostrarMensaje(error.message, "error");
  }
});

function editar(p) {
  editandoId = p._id;
  selCliente.value = p.cliente._id;
  contItems.replaceChildren();
  p.items.forEach((i) => agregarFila(i.producto._id, i.cantidad));
  document.getElementById("tituloForm").textContent = "Modificando pedido";
  document.getElementById("btnGuardar").textContent = "Actualizar pedido";
  document.getElementById("btnCancelar").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function salirDeEdicion() {
  editandoId = null;
  form.reset();
  contItems.replaceChildren();
  agregarFila();
  document.getElementById("tituloForm").textContent = "Nuevo pedido";
  document.getElementById("btnGuardar").textContent = "Guardar pedido";
  document.getElementById("btnCancelar").hidden = true;
}
document.getElementById("btnCancelar")?.addEventListener("click", () => { salirDeEdicion(); limpiarErrores(); });

// ---------- cambio de estado (PATCH) ----------
async function cambiarEstado(pedido, estado) {
  const cuerpo = { estado };
  if (estado === "Cancelado" && !confirm("¿Cancelar el pedido? No podra volver a enviarse.")) return;
  if (estado === "En camino") {
    if (!selRepartidor.value) return mostrarMensaje("Seleccione un repartidor disponible para despachar.", "error");
    cuerpo.repartidor = selRepartidor.value;
  }
  try {
    await api.patch(`/api/pedidos/${pedido._id}/estado`, cuerpo);
    mostrarMensaje(`Pedido: ${pedido.estado} → ${estado}.`);
    await Promise.all([cargar(), esPlanificador ? cargarRepartidores() : null]);
  } catch (error) {
    mostrarMensaje(error.message, "error"); // ej. 409 transicion no permitida
  }
}

[filtroEstado, filtroCliente].forEach((f) => f.addEventListener("change", cargar));

// ---------- arranque ----------
await cargarCatalogos();
if (puedeCrear) agregarFila();
await cargar();
