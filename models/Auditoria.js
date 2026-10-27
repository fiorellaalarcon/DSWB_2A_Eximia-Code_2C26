// ============================================================
// MODELO AUDITORIA  (NUEVO en la 2da entrega)
// ============================================================
// Registra QUIEN hizo QUE y CUANDO (acciones importantes).
// Es un historial de solo-agregado: nunca se edita ni se borra.
// ============================================================
import mongoose from "mongoose";

const auditoriaSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    usuarioNombre: { type: String, default: "(anonimo)" }, // copia, por si el usuario cambia
    rol: { type: String, default: "-" },
    accion: { type: String, required: true }, // CREAR, MODIFICAR, BAJA, REACTIVAR, CAMBIO_ESTADO, LOGIN, LOGIN_FALLIDO
    entidad: { type: String, required: true }, // Cliente, Producto, Pedido...
    entidadId: { type: String, default: "" },
    detalle: { type: String, default: "" },
  },
  { timestamps: { createdAt: "fecha", updatedAt: false } }
);

export const Auditoria = mongoose.model("Auditoria", auditoriaSchema);
