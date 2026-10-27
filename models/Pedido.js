// ============================================================
// MODELO PEDIDO
// ============================================================
// CAMBIO vs 1ra entrega:
//  - cliente y producto ahora son REFERENCIAS (ObjectId + ref) a otras
//    colecciones, y se usa populate() para traer sus datos.
//  - Se guarda precioUnitario (foto del precio al momento del pedido).
//  - La regla de transiciones de estado se define en UNA tabla
//    (TRANSICIONES) en vez de ifs sueltos.
//  - historialEstados: registra cada cambio (estado, quien, cuando).
//  - repartidor: asignado al despachar ("En camino").
//  - Ya no se elimina un pedido: se CANCELA (estado "Cancelado").
// ============================================================
import mongoose from "mongoose";
import { ROLES } from "./Usuario.js";

export const ESTADOS_PEDIDO = ["Pendiente", "Preparado", "En camino", "Entregado", "Cancelado"];

// Para cada estado: a que estados puede pasar y QUE ROL puede hacer cada paso.
// Una sola tabla resuelve las dos preguntas:
//   - transicion valida?  (409 si el destino no esta en la tabla)
//   - rol autorizado?     (403 si el rol no esta en la lista del destino)
// Cubre las reglas del caso: Entregado no vuelve a Pendiente (no tiene destinos) y
// Cancelado no puede ser enviado (no tiene destinos). Cada paso lo hace quien lo
// hace en el negocio: el deposito prepara, el planificador despacha y el repartidor confirma la entrega.
const { ADMINISTRATIVO, DEPOSITO, PLANIFICADOR, REPARTIDOR } = ROLES;
export const TRANSICIONES = {
  Pendiente: { Preparado: [DEPOSITO], Cancelado: [ADMINISTRATIVO] },
  Preparado: { "En camino": [PLANIFICADOR], Cancelado: [ADMINISTRATIVO, PLANIFICADOR] },
  // Entregado lo confirma quien entrego (el repartidor, y solo sobre SUS pedidos: lo
  // verifica el controlador); el planificador, desde la oficina, solo puede cancelar en ruta.
  "En camino": { Entregado: [REPARTIDOR], Cancelado: [PLANIFICADOR] },
  Entregado: {}, // estado final
  Cancelado: {}, // estado final
};

// Estados a los que un ROL puntual puede mover un pedido que esta en "estado".
export const siguientesPermitidos = (estado, rol) =>
  Object.entries(TRANSICIONES[estado] || {})
    .filter(([, roles]) => roles.includes(rol))
    .map(([destino]) => destino);

const itemSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad: { type: Number, required: true, min: [1, "La cantidad debe ser al menos 1."], validate: { validator: Number.isInteger, message: "La cantidad debe ser un entero." } },
    precioUnitario: { type: Number, required: true },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: [true, "El pedido debe estar asociado a un cliente."] },
    items: {
      type: [itemSchema],
      validate: { validator: (v) => v.length > 0, message: "El pedido debe contener al menos un producto." },
    },
    total: { type: Number, default: 0 },
    estado: { type: String, enum: ESTADOS_PEDIDO, default: "Pendiente" },
    repartidor: { type: mongoose.Schema.Types.ObjectId, ref: "Repartidor", default: null },
    historialEstados: [
      {
        _id: false,
        estado: String,
        fecha: { type: Date, default: Date.now },
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
      },
    ],
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  },
  { timestamps: true }
);

export const Pedido = mongoose.model("Pedido", pedidoSchema);
