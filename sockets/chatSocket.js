// ============================================================
// SOCKETS / CHATSOCKET.JS  (NUEVO en la 3ra entrega - Bloques 11.0 a 11.2)
// ============================================================
// Chat interno de FreshRoute en tiempo real con Socket.IO, con un asistente
// de IA (Gemini) al que se le habla con "@gemini ...".
//
// Adaptado del ejemplo de clase y MEJORADO:
//  - Solo se conectan usuarios AUTENTICADOS (se verifica el JWT de la cookie).
//  - El nombre que se muestra sale del SERVIDOR, no del cliente: nadie puede
//    escribir "en nombre de" otra persona (en el ejemplo, "usuario" lo enviaba el navegador).
//  - Se valida el mensaje (texto, hasta 500 caracteres) y hay un tiempo de espera
//    entre consultas a la IA (protege la cuota y el costo de la API key).
//  - El asistente recibe datos reales de la operacion (cantidades por estado).
//  - Se guarda un historial corto en memoria y se audita el uso de la IA.
// ============================================================
import { leerCookie } from "../utils/cookies.js";
import { NOMBRE_COOKIE } from "../services/auth.service.js";
import { usuarioDesdeToken } from "../middlewares/auth.middleware.js";
import { consultarIA } from "../services/geminiService.js";
import { resumenOperativo } from "../services/contexto.service.js";
import { registrarAuditoria } from "../services/auditoria.service.js";

const MAX_TEXTO = 500;
const ESPERA_IA_MS = 3000; // entre consultas a Gemini del mismo usuario
const MAX_HISTORIAL = 30;
const historial = []; // ultimos mensajes (se pierde al reiniciar el servidor)
const ultimaConsultaIA = new Map(); // id de usuario -> momento de su ultima consulta

const nuevoMensaje = (usuario, rol, texto) => ({ usuario, rol, texto, fecha: new Date().toISOString() });

function publicar(io, mensaje) {
  historial.push(mensaje);
  if (historial.length > MAX_HISTORIAL) historial.shift();
  io.emit("mensaje", mensaje); // a TODOS los conectados
}

export const configurarSocket = (io) => {
  // Middleware de Socket.IO: se ejecuta una vez por conexion, antes de "connection".
  io.use(async (socket, next) => {
    try {
      const token = leerCookie(socket.handshake.headers.cookie, NOMBRE_COOKIE);
      socket.data.usuario = await usuarioDesdeToken(token);
      next();
    } catch {
      next(new Error("No autorizado")); // el cliente recibe "connect_error"
    }
  });

  io.on("connection", (socket) => {
    const usuario = socket.data.usuario;
    socket.emit("historial", historial); // el recien llegado ve lo ultimo que se hablo
    io.emit("conectados", io.engine.clientsCount);

    socket.on("mensaje", async (datos) => {
      const texto = typeof datos?.texto === "string" ? datos.texto.trim() : "";
      if (!texto || texto.length > MAX_TEXTO) {
        return socket.emit("aviso", `El mensaje debe tener entre 1 y ${MAX_TEXTO} caracteres.`);
      }
      publicar(io, nuevoMensaje(usuario.nombre, usuario.rol, texto));

      // Mensaje dirigido al asistente: "@gemini ¿cuantos pedidos hay pendientes?"
      if (!texto.toLowerCase().startsWith("@gemini")) return;
      const pregunta = texto.slice("@gemini".length).trim();
      if (!pregunta) return socket.emit("aviso", "Escriba su consulta despues de @gemini.");

      const ahora = Date.now();
      if (ahora - (ultimaConsultaIA.get(String(usuario._id)) ?? 0) < ESPERA_IA_MS) {
        return socket.emit("aviso", "Espere unos segundos antes de volver a consultar al asistente.");
      }
      ultimaConsultaIA.set(String(usuario._id), ahora);

      try {
        const respuesta = await consultarIA(pregunta, await resumenOperativo(usuario));
        await registrarAuditoria(usuario, { accion: "CONSULTA_IA", entidad: "Chat", detalle: `Consulta al asistente (${pregunta.length} caracteres).` });
        publicar(io, nuevoMensaje("Asistente FreshRoute (IA)", "ia", respuesta));
      } catch (error) {
        console.error("Error al consultar a Gemini:", error.message);
        const motivo = error.statusCode === 503 ? error.message : "Lo siento, ocurrio un error al procesar su consulta con el asistente.";
        publicar(io, nuevoMensaje("Asistente FreshRoute (IA)", "ia", motivo));
      }
    });

    socket.on("disconnect", () => io.emit("conectados", io.engine.clientsCount));
  });
};
