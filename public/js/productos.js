import { iniciarCrud } from "./crud-pagina.js";
import { formatearPesos } from "./ui.js";

iniciarCrud({
  endpoint: "/api/productos",
  entidad: "Producto",
  columnas: [{ campo: "nombre" }, { campo: "descripcion" }, { campo: "precio", formato: formatearPesos }],
  busqueda: "filtroNombre", // GET /api/productos?nombre=...
  permisos: {
    ver: ["administrador", "administrativo", "deposito", "planificador", "directivo"],
    editar: ["administrativo"], // la oficina administra el catalogo
    baja: ["administrativo"],
    reactivar: ["administrador"],
  },
});