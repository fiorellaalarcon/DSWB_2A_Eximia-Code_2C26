// ============================================================
// UI.JS (navegador) - utilidades del DOM
// ============================================================

// Crea un elemento con texto SEGURO: textContent no interpreta HTML,
// asi un nombre como "<script>" se muestra como texto y no se ejecuta
// (evita XSS; la version de clase usaba innerHTML con los datos).
export function el(etiqueta, props = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  Object.assign(nodo, props);
  nodo.append(...hijos);
  return nodo;
}

let temporizador;
export function mostrarMensaje(texto, tipo = "ok") {
  const caja = document.getElementById("mensaje");
  caja.textContent = texto;
  caja.className = `mensaje ${tipo}`;
  caja.hidden = false;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (caja.hidden = true), 5000);
}

// Muestra los errores de validacion (400) debajo del formulario.
export function mostrarErrores(errores = []) {
  const lista = document.getElementById("erroresForm");
  if (!lista) return;
  lista.replaceChildren(...errores.map((e) => el("li", { textContent: e.mensaje })));
  lista.hidden = errores.length === 0;
  document.querySelectorAll(".invalido").forEach((i) => i.classList.remove("invalido"));
  errores.forEach((e) => document.querySelector(`[name="${e.campo}"]`)?.classList.add("invalido"));
}

export const limpiarErrores = () => mostrarErrores([]);

export const formatearFecha = (iso) =>
  iso ? new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "-";

export const formatearPesos = (n) => `$${Number(n).toLocaleString("es-AR")}`;