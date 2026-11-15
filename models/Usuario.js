// ============================================================
// MODELO USUARIO
// ============================================================
// Representa a quien inicia sesion en el sistema y su ROL
// (ver middlewares/roles.middleware.js).
//
// CAMBIO en la 3ra entrega (seguridad):
//  - La contrasena YA NO se guarda en texto plano. Se guarda un HASH
//    (PBKDF2) y una SAL unica por usuario (services/auth.service.js).
//  - La politica de contrasena (8+, mayuscula, minuscula, especial) se
//    sigue validando en las 3 capas: ahora la 3ra capa corre ANTES de
//    hashear, dentro del hook pre("validate") de este modelo.
//  - El resto del codigo no cambio: sigue escribiendo "usuario.password = x".
// ============================================================
import mongoose from "mongoose";
import { errorPassword } from "../public/js/reglas.js"; // reglas compartidas (front, back y BD)
import { crearPasswordSeguro, verificarPassword } from "../services/auth.service.js";

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
    // Lo que se guarda: hash + sal. select:false -> nunca viajan en las consultas por defecto.
    passwordHash: { type: String, required: [true, "La contrasena es obligatoria."], select: false },
    salt: { type: String, required: true, select: false },
    rol: {
      type: String,
      enum: { values: Object.values(ROLES), message: "Rol no permitido." },
      required: [true, "El rol es obligatorio."],
    },
    // Solo para el rol "repartidor": a cual registro de la flota corresponde.
    repartidor: { type: mongoose.Schema.Types.ObjectId, ref: "Repartidor" },
    activo: { type: Boolean, default: true }, // baja logica
  },
  {
    timestamps: true, // createdAt / updatedAt automaticos
    toJSON: {
      // Defensa extra: aunque se devuelva el documento recien creado, nunca sale el hash ni la sal.
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.salt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Campo VIRTUAL "password": existe solo en memoria (no se guarda). Al asignarlo
// queda esperando al hook de abajo, que lo valida y lo convierte en hash + sal.
usuarioSchema.virtual("password").set(function (passwordPlano) {
  this._passwordPlano = passwordPlano;
});

usuarioSchema.pre("validate", async function () {
  if (this._passwordPlano === undefined) return; // no se cambio la contrasena
  const error = errorPassword(this._passwordPlano); // CAPA 3: politica de contrasena
  if (error) {
    this.invalidate("password", error);
    return;
  }
  const { salt, passwordHash } = await crearPasswordSeguro(this._passwordPlano);
  this.salt = salt;
  this.passwordHash = passwordHash;
  this._passwordPlano = undefined; // la clave en texto plano no se conserva en memoria
});

// Punto unico de comparacion (requiere haber consultado con .select("+passwordHash +salt")).
usuarioSchema.methods.verificarPassword = function (passwordIngresada) {
  return verificarPassword(passwordIngresada, this.salt, this.passwordHash);
};

export const Usuario = mongoose.model("Usuario", usuarioSchema);
