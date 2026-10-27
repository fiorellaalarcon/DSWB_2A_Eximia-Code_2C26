import { iniciarCrud } from "./crud-pagina.js";

iniciarCrud({
  endpoint: "/api/repartidores",
  entidad: "Repartidor",
  columnas: [
    { campo: "nombre" },
    { campo: "telefono" },
    { campo: "patente" },
    { campo: "disponible", formato: (v) => (v ? "Si" : "No (en entrega)") },
  ],
  permisos: {
    ver: ["administrador", "administrativo", "deposito", "planificador", "directivo"],
    editar: ["planificador"], // quien planifica rutas gestiona repartidores
    baja: ["planificador"],
    reactivar: ["administrador"],
  },
});