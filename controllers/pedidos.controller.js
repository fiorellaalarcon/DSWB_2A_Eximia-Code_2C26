// ============================================================
// CONTROLADOR PEDIDOS  (CAMBIA en la 3ra entrega)
// ============================================================
// Antes (2da entrega) este archivo tenia ~150 lineas con TODAS las reglas de
// negocio. Ahora las reglas viven en services/pedidos.service.js y el
// controlador solo COORDINA: toma la entrada (req), llama al servicio y
// arma la respuesta HTTP (codigo de estado + JSON).
// ============================================================
import { manejarAsync } from "../utils/manejarAsync.js";
import * as pedidos from "../services/pedidos.service.js";

const io = (req) => req.app.get("io"); // Socket.IO, para avisar cambios en tiempo real

// GET /api/pedidos?cliente=<id>&estado=Pendiente
export const listar = manejarAsync(async (req, res) => {
  res.status(200).json(await pedidos.listarPedidos(req.query, req.usuario));
});

// GET /api/pedidos/:id
export const obtener = manejarAsync(async (req, res) => {
  res.status(200).json(await pedidos.obtenerPedido(req.params.id, req.usuario));
});

// POST /api/pedidos
export const crear = manejarAsync(async (req, res) => {
  res.status(201).json(await pedidos.crearPedido(req.body, req.usuario, io(req)));
});

// PUT /api/pedidos/:id
export const actualizar = manejarAsync(async (req, res) => {
  res.status(200).json(await pedidos.actualizarPedido(req.params.id, req.body, req.usuario, io(req)));
});

// PATCH /api/pedidos/:id/estado   body: { estado, repartidor? }
export const cambiarEstado = manejarAsync(async (req, res) => {
  const pedido = await pedidos.cambiarEstadoPedido(req.params.id, req.body, req.usuario, io(req));
  res.status(200).json({ mensaje: "Estado actualizado correctamente.", pedido });
});
