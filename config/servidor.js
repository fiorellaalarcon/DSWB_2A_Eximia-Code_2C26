// ============================================================
// CONFIG / SERVIDOR.JS (NUEVO)
// ============================================================
// Express (HTTP) y Socket.IO (tiempo real) comparten UN solo servidor
// HTTP de Node: createServer(app). Esta funcion lo arma y lo usan tanto
// index.js como los tests, para no duplicar la configuracion.
// ============================================================
import { createServer } from "node:http";
import { Server } from "socket.io";
import { configurarSocket } from "../sockets/chatSocket.js";

export function crearServidor(app) {
  const server = createServer(app); // el mundo HTTP envuelto en un servidor nativo
  const io = new Server(server); // el mundo en tiempo real montado sobre el mismo servidor
  app.set("io", io); // los servicios emiten eventos con req.app.get("io")
  configurarSocket(io);
  return { server, io };
}
