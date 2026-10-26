// ============================================================
// MODELO CLIENTE
// ============================================================
// CAMBIO vs 1ra entrega: ya no es una clase JS que hereda de
// Persona y se guarda en JSON. Ahora es un Schema de Mongoose
// (la validacion de tipos/obligatorios la hace el esquema).
// La herencia Persona -> Cliente se reemplaza por un esquema
// simple: Mongoose ya resuelve id (_id), validacion y timestamps.
// NUEVO: activo (baja logica) y creadoPor/modificadoPor (trazabilidad).
// ============================================================
import mongoose from "mongoose";
import { REGEX_EMAIL, MENSAJE_EMAIL } from "../public/js/reglas.js"; // misma regla que front y backend

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio."], trim: true },
    email: {
      type: String,
      required: [true, "El email es obligatorio."],
      match: [REGEX_EMAIL, MENSAJE_EMAIL], // capa 3: el email debe llevar @ y dominio
      unique: true, // evita duplicados (409)
      trim: true,
      lowercase: true,
    },
    direccion: { type: String, required: [true, "La direccion es obligatoria."], trim: true },
    telefono: { type: String, required: [true, "El telefono es obligatorio."], trim: true },
    activo: { type: Boolean, default: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  },
  { timestamps: true }
);

export const Cliente = mongoose.model("Cliente", clienteSchema);
