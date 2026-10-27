// ============================================================
// CRUD-PAGINA.JS (navegador) - logica comun de las pantallas
// Clientes / Productos / Repartidores / Usuarios
// ============================================================
// Es la version mejorada del app.js de la clase del profesor:
//  - mismo patron: variable "editando", submit con preventDefault,
//    POST si es alta y PUT si es edicion, recarga de la tabla;
//  - pero ahora: manejo de errores HTTP, mensajes, roles, baja
//    logica (en vez de eliminar), historial y sin innerHTML.
// Cada pagina solo declara su configuracion (ver clientes.js).
// ============================================================
import { api } from "./api.js";
import { protegerPagina } from "./auth.js";
import { validarFormulario } from "./validaciones.js";
import { el, mostrarMensaje, mostrarErrores, limpiarErrores, formatearFecha } from "./ui.js";

export async function iniciarCrud({ endpoint, entidad, columnas, permisos, busqueda }) {
  const usuario = protegerPagina(permisos.ver);

  const form = document.getElementById("formulario");
  const tabla = document.getElementById("tabla");
  const chkInactivos = document.getElementById("chkInactivos");
  const btnCancelar = document.getElementById("btnCancelar");
  const titulo = document.getElementById("tituloForm");

  // Variables de control (igual que en la clase):
  // null = estamos dando de alta | id de Mongo = estamos editando
  let editandoId = null;
  let registros = [];

  const puede = (accion) => permisos[accion]?.includes(usuario.rol);

  // ---- CONSULTAR: pide los datos al backend y dibuja la tabla ----
  async function cargar() {
    const params = new URLSearchParams();
    if (chkInactivos?.checked) params.set("incluirInactivos", "true");
    if (busqueda && document.getElementById(busqueda).value.trim())
      params.set("nombre", document.getElementById(busqueda).value.trim());
    try {
      registros = await api.get(`${endpoint}?${params}`);
      dibujarTabla();
    } catch (error) {
      mostrarMensaje(error.message, "error");
    }
  }

  function dibujarTabla() {
    tabla.replaceChildren();
    if (registros.length === 0) {
      tabla.append(el("tr", {}, el("td", { colSpan: 10, textContent: "Sin registros." })));
      return;
    }
    for (const r of registros) {
      const fila = el("tr", { className: r.activo ? "" : "inactivo" });
      columnas.forEach((c) => fila.append(el("td", { textContent: c.formato ? c.formato(r[c.campo]) : (r[c.campo] ?? "") })));
      fila.append(
        el("td", {}, el("span", { className: `etiqueta ${r.activo ? "ok" : "off"}`, textContent: r.activo ? "Activo" : "Inactivo" })),
        el("td", { textContent: formatearFecha(r.updatedAt) })
      );

      const acciones = el("td", { className: "acciones" });
      if (r.activo && puede("editar")) acciones.append(el("button", { textContent: "Modificar", onclick: () => editar(r) }));
      if (r.activo && puede("baja")) acciones.append(el("button", { className: "peligro", textContent: "Dar de baja", onclick: () => darDeBaja(r) }));
      if (!r.activo && puede("reactivar")) acciones.append(el("button", { textContent: "Reactivar", onclick: () => reactivar(r) }));
      fila.append(acciones);
      tabla.append(fila);
    }
  }

  // ---- ALTA / EDICION sin recargar la pagina ----
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();

    // CAPA 1 (frontend): se valida antes de enviar; si hay errores NO se hace el fetch.
    const erroresFront = validarFormulario(form, { esAlta: !editandoId });
    if (erroresFront.length > 0) {
      mostrarErrores(erroresFront);
      return mostrarMensaje("Revise los datos del formulario.", "error");
    }

    // Arma el objeto desde los inputs del formulario.
    const datos = {};
    for (const campo of form.elements) {
      if (!campo.name) continue;
      if (campo.type === "number") datos[campo.name] = campo.value === "" ? undefined : Number(campo.value);
      else if (campo.name === "password" && campo.value === "") continue; // no cambiar clave
      else datos[campo.name] = campo.value;
    }

    try {
      if (editandoId) {
        await api.put(`${endpoint}/${editandoId}`, datos); // PUT = edicion
        mostrarMensaje(`${entidad} actualizado correctamente.`);
      } else {
        await api.post(endpoint, datos); // POST = alta
        mostrarMensaje(`${entidad} creado correctamente.`);
      }
      salirDeEdicion();
      await cargar(); // actualiza la tabla sin recargar
    } catch (error) {
      mostrarErrores(error.errores); // errores por campo (400)
      mostrarMensaje(error.message, "error"); // 404, 409, 403...
    }
  });

  // Carga los datos del registro en el formulario y pasa a modo edicion.
  function editar(registro) {
    editandoId = registro._id;
    for (const campo of form.elements) {
      if (campo.name && campo.name !== "password") campo.value = registro[campo.name] ?? "";
    }
    titulo.textContent = `Modificando ${entidad.toLowerCase()}`;
    document.getElementById("btnGuardar").textContent = "Actualizar";
    btnCancelar.hidden = false;
    limpiarErrores();
    form.elements[0].focus();
  }

  function salirDeEdicion() {
    editandoId = null;
    form.reset();
    titulo.textContent = `Nuevo ${entidad.toLowerCase()}`;
    document.getElementById("btnGuardar").textContent = "Guardar";
    btnCancelar.hidden = true;
  }
  btnCancelar?.addEventListener("click", () => { salirDeEdicion(); limpiarErrores(); });

  // ---- BAJA LOGICA (DELETE): el registro pasa a inactivo, no se borra ----
  async function darDeBaja(registro) {
    if (!confirm(`¿Dar de baja a "${registro.nombre}"? Quedara inactivo y conservado en el historial.`)) return;
    try {
      const r = await api.delete(`${endpoint}/${registro._id}`);
      mostrarMensaje(r.mensaje);
      salirDeEdicion();
      await cargar();
    } catch (error) {
      mostrarMensaje(error.message, "error");
    }
  }

  async function reactivar(registro) {
    try {
      const r = await api.patch(`${endpoint}/${registro._id}/reactivar`);
      mostrarMensaje(r.mensaje);
      await cargar();
    } catch (error) {
      mostrarMensaje(error.message, "error");
    }
  }

  chkInactivos?.addEventListener("change", cargar);
  if (busqueda) document.getElementById(busqueda).addEventListener("input", cargar); // busqueda "en vivo"

  await cargar(); // al abrir la pagina cargamos los datos
}