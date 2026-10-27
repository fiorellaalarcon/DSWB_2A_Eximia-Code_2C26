// Pantalla de auditoria (solo lectura): quien hizo que y cuando.
import { api } from "./api.js";
import { protegerPagina } from "./auth.js";
import { el, formatearFecha, mostrarMensaje } from "./ui.js";

protegerPagina(["administrador", "directivo"]);

const tabla = document.getElementById("tabla");
const filtros = ["filtroEntidad", "filtroAccion"].map((id) => document.getElementById(id));

async function cargar() {
  const params = new URLSearchParams();
  if (filtros[0].value) params.set("entidad", filtros[0].value);
  if (filtros[1].value) params.set("accion", filtros[1].value);
  try {
    const registros = await api.get(`/api/auditoria?${params}`);
    tabla.replaceChildren(
      ...registros.map((r) =>
        el("tr", {}, ...[formatearFecha(r.fecha), r.usuarioNombre, r.rol, r.accion, r.entidad, r.detalle].map((t) => el("td", { textContent: t })))
      )
    );
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}
filtros.forEach((f) => f.addEventListener("change", cargar));
cargar();
