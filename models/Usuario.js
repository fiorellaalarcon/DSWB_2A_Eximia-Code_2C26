// ============================================================
// MODELO USUARIO  (NUEVO en la 2da entrega)
// ============================================================
// Representa a quien inicia sesion en el sistema y su ROL.
// El rol define que puede hacer (ver middlewares/roles.middleware.js).
//
// !!! LIMITACION DOCUMENTADA !!!
// La contrasena se guarda y compara en TEXTO PLANO porque en esta
// instancia todavia no se vio hash/encriptacion. NO es una practica
// segura para produccion. La estructura ya esta preparada: el unico
// lugar donde se compara es el metodo verificarPassword(), y el unico
// lugar donde se guardaria es este esquema; al incorporar bcrypt
// (3ra entrega) solo se modifican esos dos puntos.
// ============================================================
import mongoose from "mongoose";
import { errorPassword, MENSAJE_PASSWORD } from "../public/js/reglas.js"; // reglas compartidas (front, back y BD)

// ROLES = perfiles que describe el caso FreshRoute (administrativos, operadores de
// deposito, planificadores de rutas, choferes/repartidores y direccion). Cada rol existe porque en el
// negocio hay una persona que hace ESA tarea; no se inventaron roles genericos.
export const ROLES = {
  ADMINISTRADOR: "administrador", // sistemas: gestiona usuarios, reactiva registros, ve auditoria
  ADMINISTRATIVO: "administrativo", // oficina: clientes, productos, alta/edicion/cancelacion de pedidos
  DEPOSITO: "deposito", // operador de deposito: prepara pedidos (Pendiente -> Preparado)
  PLANIFICADOR: "planificador", // planifica rutas: gestiona repartidores, despacha y cancela en ruta
  REPARTIDOR: "repartidor", // chofer en la calle: ve SUS pedidos y confirma la entrega (En camino -> Entregado)
  DIRECTIVO: "directivo", // direccion: solo lectura + historial/inactivos/auditoria
};

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio."], trim: true },
    usuario: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio."],
      unique: true,
      trim: true,
      lowercase: true,
    },
    // select:false -> la contrasena NUNCA viaja en las consultas por defecto.
    // CAPA 3 (base de datos): ademas de required, el esquema exige la politica de contrasena.
    // select:false -> la contrasena NUNCA viaja en las consultas por defecto.
    password: {
      type: String,
      required: [true, "La contrasena es obligatoria."],
      validate: { validator: (v) => errorPassword(v) === null, message: MENSAJE_PASSWORD },
      select: false,
    },
    rol: {
      type: String,
      enum: { values: Object.values(ROLES), message: "Rol no permitido." },
      required: [true, "El rol es obligatorio."],
    },
    // Solo para el rol "repartidor": a cual registro de la coleccion Repartidores corresponde.
    // Asi el sistema sabe cuales son SUS pedidos y puede impedir que cierre los de otro.
    repartidor: { type: mongoose.Schema.Types.ObjectId, ref: "Repartidor" },
    activo: { type: Boolean, default: true }, // baja logica
  },
  { timestamps: true } // createdAt / updatedAt automaticos
);

// Punto unico de comparacion (hoy texto plano; en la próxima entrega bcrypt.compare).
usuarioSchema.methods.verificarPassword = function (passwordIngresada) {
  return this.password === passwordIngresada;
};

export const Usuario = mongoose.model("Usuario", usuarioSchema);
