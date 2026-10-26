import { iniciarCrud } from "./crud-pagina.js";

iniciarCrud({
  endpoint: "/api/clientes",
  entidad: "Cliente",
  columnas: [{ campo: "nombre" }, { campo: "email" }, { campo: "direccion" }, { campo: "telefono" }],
  permisos: {
    ver: ["administrador", "administrativo", "deposito", "planificador", "directivo"],
    editar: ["administrativo"], // la oficina administra clientes
    baja: ["administrativo"],
    reactivar: ["administrador"],
  },
});
