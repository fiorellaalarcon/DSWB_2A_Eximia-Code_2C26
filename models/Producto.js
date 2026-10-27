// ============================================================
// MODELO PRODUCTO
// ============================================================
// CAMBIO vs 1ra entrega: Schema de Mongoose. Se agregan unidad,
// stock (opcional), activo (baja logica) y trazabilidad.
// ============================================================
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre del producto es obligatorio."], trim: true },
    descripcion: { type: String, trim: true, default: "" },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio."],
      min: [0.01, "El precio debe ser mayor a cero."],
    },
    activo: { type: Boolean, default: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  },
  { timestamps: true }
);

export const Producto = mongoose.model("Producto", productoSchema);