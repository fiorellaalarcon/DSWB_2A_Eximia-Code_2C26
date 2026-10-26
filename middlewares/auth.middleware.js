// ============================================================
// MIDDLEWARE DE IDENTIFICACION (NUEVO)
// ============================================================
// Todavia NO se trabajan sesiones, cookies ni tokens (JWT). Por eso
// la identificacion es simple: el frontend guarda los datos del
// usuario que devolvio /api/auth/login y en cada fetch envia su id
// en el encabezado "x-usuario-id".
// Este middleware busca ese usuario en MongoDB, verifica que siga
// ACTIVO y lo deja en req.usuario para los middlewares/controladores
// siguientes. El ROL siempre se lee de la base, nunca del cliente.
//
// LIMITACION (documentada): un id en un encabezado puede falsificarse.
// Es un mecanismo transitorio; en la 3ra entrega se reemplaza por
// sesion/token sin tocar controladores.
// ============================================================
import mongoose from "mongoose";
import { Usuario } from "../models/Usuario.js";
import { AppError } from "../utils/AppError.js";
import { manejarAsync } from "../utils/manejarAsync.js";

export const identificarUsuario = manejarAsync(async (req, res, next) => {
  const id = req.header("x-usuario-id");

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new AppError("Debe iniciar sesion para realizar esta operacion.", 401);
  }

  const usuario = await Usuario.findById(id); // password no se trae (select:false)
  if (!usuario || !usuario.activo) {
    throw new AppError("Usuario inexistente o dado de baja.", 401);
  }

  req.usuario = usuario;
  next();
});
