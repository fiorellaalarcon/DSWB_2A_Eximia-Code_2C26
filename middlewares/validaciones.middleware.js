// ============================================================
// MIDDLEWARES DE VALIDACION (NUEVO)
// ============================================================
// CAMBIO vs 1ra entrega ("por el momento sin middleware"): ahora
// las validaciones de entrada viven en middlewares que se colocan
// ANTES del controlador en la ruta:
//
//   router.post("/", validarCliente, controller.crear)
//
// Si hay errores responden 400 con la lista de campos incorrectos y
// el controlador ni se ejecuta. El esquema de Mongoose queda como
// segunda barrera (defensa en profundidad).
// Se escribe a mano (sin librerias externas) para mantener el
// alcance de lo visto en clase.
// ============================================================
import mongoose from "mongoose";
import { ROLES } from "../models/Usuario.js";
import { ESTADOS_PEDIDO } from "../models/Pedido.js";
import { AppError } from "../utils/AppError.js";
// Reglas compartidas con el frontend y los esquemas de Mongoose (una sola fuente).
import { errorEmail, errorPassword } from "../public/js/reglas.js";

// ---- helpers ----
const esTextoValido = (v) => typeof v === "string" && v.trim().length > 0;

// Corta la solicitud con 400 si hay errores acumulados.
const responderSiHayErrores = (errores, next) => {
  if (errores.length > 0) {
    return next(new AppError("Datos invalidos.", 400, errores));
  }
  next();
};

// Valida que el parametro :id de la ruta sea un ObjectId de Mongo.
export const validarId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError("El id recibido no tiene un formato valido.", 400));
  }
  next();
};

export const validarLogin = (req, res, next) => {
  const { usuario, password } = req.body;
  const errores = [];
  if (!esTextoValido(usuario)) errores.push({ campo: "usuario", mensaje: "El usuario es obligatorio." });
  if (!esTextoValido(password)) errores.push({ campo: "password", mensaje: "La contrasena es obligatoria." });
  responderSiHayErrores(errores, next);
};

export const validarCliente = (req, res, next) => {
  const { nombre, email, direccion, telefono } = req.body;
  const errores = [];
  if (!esTextoValido(nombre)) errores.push({ campo: "nombre", mensaje: "El nombre es obligatorio." });
  const eEmail = errorEmail(email);
  if (eEmail) errores.push({ campo: "email", mensaje: eEmail });
  if (!esTextoValido(direccion)) errores.push({ campo: "direccion", mensaje: "La direccion es obligatoria." });
  if (!esTextoValido(telefono)) errores.push({ campo: "telefono", mensaje: "El telefono es obligatorio." });
  responderSiHayErrores(errores, next);
};

export const validarProducto = (req, res, next) => {
  const { nombre, precio } = req.body;
  const errores = [];
  if (!esTextoValido(nombre)) errores.push({ campo: "nombre", mensaje: "El nombre del producto es obligatorio." });
  if (typeof precio !== "number" || Number.isNaN(precio) || precio <= 0)
    errores.push({ campo: "precio", mensaje: "El precio debe ser un numero mayor a cero." });
  responderSiHayErrores(errores, next);
};

export const validarRepartidor = (req, res, next) => {
  const { nombre, telefono } = req.body;
  const errores = [];
  if (!esTextoValido(nombre)) errores.push({ campo: "nombre", mensaje: "El nombre es obligatorio." });
  if (!esTextoValido(telefono)) errores.push({ campo: "telefono", mensaje: "El telefono es obligatorio." });
  responderSiHayErrores(errores, next);
};

// esAlta=true  -> la contrasena es obligatoria (POST)
// esAlta=false -> la contrasena es opcional (PUT: solo se cambia si se envia)
const validarUsuarioBase = (esAlta) => (req, res, next) => {
  const { nombre, usuario, password, rol, repartidor } = req.body;
  const errores = [];
  if (!esTextoValido(nombre)) errores.push({ campo: "nombre", mensaje: "El nombre es obligatorio." });
  if (!esTextoValido(usuario)) errores.push({ campo: "usuario", mensaje: "El usuario es obligatorio." });
  if (esAlta || password !== undefined) {
    const ePassword = errorPassword(password); // 8+ caracteres, mayuscula, minuscula y caracter especial
    if (ePassword) errores.push({ campo: "password", mensaje: ePassword });
  }
  if (!Object.values(ROLES).includes(rol))
    errores.push({ campo: "rol", mensaje: `El rol debe ser uno de: ${Object.values(ROLES).join(", ")}.` });
  // Un usuario con rol "repartidor" debe estar vinculado a un repartidor de la flota.
  if (rol === ROLES.REPARTIDOR && !mongoose.isValidObjectId(repartidor))
    errores.push({ campo: "repartidor", mensaje: "Un usuario repartidor debe estar vinculado a un repartidor." });
  responderSiHayErrores(errores, next);
};
export const validarUsuarioAlta = validarUsuarioBase(true);
export const validarUsuarioEdicion = validarUsuarioBase(false);

export const validarPedido = (req, res, next) => {
  const { cliente, items } = req.body;
  const errores = [];
  if (!mongoose.isValidObjectId(cliente))
    errores.push({ campo: "cliente", mensaje: "El pedido debe estar asociado a un cliente valido." });
  if (!Array.isArray(items) || items.length === 0) {
    errores.push({ campo: "items", mensaje: "El pedido debe contener al menos un producto." });
  } else {
    items.forEach((item, i) => {
      if (!mongoose.isValidObjectId(item?.producto))
        errores.push({ campo: `items[${i}].producto`, mensaje: "Producto invalido." });
      if (!Number.isInteger(item?.cantidad) || item.cantidad <= 0)
        errores.push({ campo: `items[${i}].cantidad`, mensaje: "La cantidad debe ser un entero mayor a cero." });
    });
  }
  responderSiHayErrores(errores, next);
};

export const validarCambioEstado = (req, res, next) => {
  const { estado, repartidor } = req.body;
  const errores = [];
  if (!ESTADOS_PEDIDO.includes(estado))
    errores.push({ campo: "estado", mensaje: `El estado debe ser uno de: ${ESTADOS_PEDIDO.join(", ")}.` });
  if (repartidor !== undefined && !mongoose.isValidObjectId(repartidor))
    errores.push({ campo: "repartidor", mensaje: "Repartidor invalido." });
  responderSiHayErrores(errores, next);
};