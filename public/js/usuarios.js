import { iniciarCrud } from "./crud-pagina.js";
import { api } from "./api.js";
import { protegerPagina } from "./auth.js";
import { el } from "./ui.js";

// Modulo exclusivo del administrador (iniciarCrud tambien protege la pagina, por eso el menu se dibuja una sola vez).
protegerPagina(["administrador"]);

// Un usuario con rol "repartidor" se vincula a un registro de la flota.
// Se cargan los repartidores (tambien inactivos, para mostrar su nombre en la tabla).
const repartidores = await api.get("/api/repartidores?incluirInactivos=true");
const nombrePorId = new Map(repartidores.map((r) => [r._id, r.nombre]));

document.getElementById("repartidor").append(
  ...repartidores.filter((r) => r.activo).map((r) => el("option", { value: r._id, textContent: `${r.nombre} ${r.patente ? `(${r.patente})` : ""}` }))
);

iniciarCrud({
  endpoint: "/api/usuarios",
  entidad: "Usuario",
  columnas: [
    { campo: "nombre" },
    { campo: "usuario" },
    { campo: "rol" },
    { campo: "repartidor", formato: (id) => nombrePorId.get(id) ?? "-" },
  ],
  permisos: {
    ver: ["administrador"],
    editar: ["administrador"],
    baja: ["administrador"],
    reactivar: ["administrador"],
  },
});
