// ============================================================
// MODELO REPARTIDOR  (NUEVO en la 2da entrega)
// ============================================================
// En la 1ra entrega quedo como "proximo modulo". Se incorpora
// porque el caso FreshRoute exige la regla de negocio:
// "Solo un repartidor disponible puede recibir un pedido".
// disponible: true/false (estado operativo) != activo (baja logica).
// ============================================================
import mongoose from "mongoose";

const repartidorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio."], trim: true },
    telefono: { type: String, required: [true, "El telefono es obligatorio."], trim: true },
    patente: { type: String, trim: true, uppercase: true, default: "" },
    disponible: { type: Boolean, default: true },
    activo: { type: Boolean, default: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  },
  { timestamps: true, collection: "repartidores" } // evita el plural "repartidors"
);

export const Repartidor = mongoose.model("Repartidor", repartidorSchema);