// ============================================================
// CONFIG / DB.JS  -  CONEXION A MONGODB
// ============================================================
// CAMBIO vs 1ra entrega: antes se leian/escribian archivos JSON
// (utils/jsonStorage.js). Ahora toda la persistencia pasa por
// MongoDB usando Mongoose. Este archivo SOLO se ocupa de conectar.
//
// La URI viene de la variable de entorno MONGO_URI (archivo .env),
// asi no hay credenciales escritas en el codigo (buena practica) y
// pasar de Compass/local a Atlas (3ra entrega) es cambiar una linea.
// ============================================================
import mongoose from "mongoose";

export const conectarDB = async (uri = process.env.MONGO_URI) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB conectado:", mongoose.connection.name);
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error.message);
    process.exit(1); // sin base de datos la app no puede funcionar
  }
};
