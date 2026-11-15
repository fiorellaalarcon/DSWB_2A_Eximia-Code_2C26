// ============================================================
// SERVICES / PEDIDOS.SERVICE.JS  (NUEVO en la 3ra entrega)
// ============================================================
// Capa de SERVICIOS: concentra las REGLAS DE NEGOCIO de los pedidos
// (existencia de relacionados, transiciones, permisos por rol, repartidor
// disponible). El controlador quedo solo como coordinador: recibe la
// solicitud, llama al servicio y responde (arquitectura de la teoria:
// Rutas -> Controladores -> Servicios -> Modelos -> MongoDB).
//
// MEJORAS de rendimiento/mantenimiento respecto de la 2da entrega:
//  - prepararPedido hacia 1 consulta por producto (N+1); ahora UNA sola con $in.
//  - Al cambiar un pedido se emite un evento Socket.IO para que las pantallas
//    abiertas se actualicen solas (tiempo real).
// ============================================================
import mongoose from "mongoose";
import { Pedido, ESTADOS_PEDIDO, TRANSICIONES, siguientesPermitidos } from "../models/Pedido.js";
import { Cliente } from "../models/Cliente.js";
import { Producto } from "../models/Producto.js";
import { Repartidor } from "../models/Repartidor.js";
import { AppError } from "../utils/AppError.js";
import { registrarAuditoria } from "./auditoria.service.js";

// Datos relacionados que se "pegan" a cada pedido en las respuestas.
const POPULATE = [
  { path: "cliente", select: "nombre direccion" },
  { path: "repartidor", select: "nombre patente" },
  { path: "items.producto", select: "nombre" },
];

// Pedido -> JSON con "siguientesEstados": SOLO los pasos que el rol puede hacer.
const presentar = (pedido, rol) => ({
  ...pedido.toJSON(),
  siguientesEstados: siguientesPermitidos(pedido.estado, rol),
});

// El pedido tiene asignado a este usuario-repartidor? (acepta repartidor poblado o solo id)
const esDelRepartidor = (pedido, usuario) =>
  Boolean(pedido.repartidor) &&
  Boolean(usuario.repartidor) &&
  String(pedido.repartidor._id ?? pedido.repartidor) === String(usuario.repartidor);

// Avisa a todas las pantallas conectadas. Solo viaja el id y el estado (nunca datos
// personales): cada cliente vuelve a pedir la lista por la API, que aplica los permisos.
const avisarCambio = (io, pedido) => io?.emit("pedido:actualizado", { id: String(pedido._id), estado: pedido.estado });

const buscarOError = async (id) => {
  const pedido = await Pedido.findById(id);
  if (!pedido) throw new AppError("Pedido no encontrado.", 404);
  return pedido;
};

// Verifica existencia del cliente y de los productos y arma los items con precio congelado.
async function prepararPedido(clienteId, itemsEntrada) {
  const cliente = await Cliente.findById(clienteId);
  if (!cliente) throw new AppError("El cliente indicado no existe.", 404);
  if (!cliente.activo) throw new AppError("El cliente indicado esta inactivo.", 409);

  // UNA consulta para todos los productos (antes: una por producto).
  const ids = [...new Set(itemsEntrada.map((i) => String(i.producto)))];
  const productos = await Producto.find({ _id: { $in: ids } });
  const porId = new Map(productos.map((p) => [String(p._id), p]));

  const items = itemsEntrada.map(({ producto: productoId, cantidad }) => {
    const producto = porId.get(String(productoId));
    if (!producto) throw new AppError(`El producto ${productoId} no existe.`, 404);
    if (!producto.activo) throw new AppError(`El producto "${producto.nombre}" esta inactivo.`, 409);
    return { producto: producto._id, cantidad, precioUnitario: producto.precio };
  });
  const total = items.reduce((suma, i) => suma + i.cantidad * i.precioUnitario, 0);
  return { cliente: cliente._id, items, total };
}

// --- Casos de uso -----------------------------------------------------------

export async function listarPedidos(query, usuario) {
  const filtro = {};
  if (query.cliente !== undefined) {
    if (!mongoose.isValidObjectId(query.cliente)) throw new AppError("El parametro cliente no es un id valido.", 400);
    filtro.cliente = query.cliente;
  }
  if (query.estado !== undefined) {
    if (!ESTADOS_PEDIDO.includes(query.estado)) throw new AppError(`Estado invalido. Valores: ${ESTADOS_PEDIDO.join(", ")}.`, 400);
    filtro.estado = query.estado;
  }
  // El repartidor solo ve los pedidos que tiene asignados.
  if (usuario.rol === "repartidor") {
    if (!usuario.repartidor) return [];
    filtro.repartidor = usuario.repartidor;
  }
  const pedidos = await Pedido.find(filtro).populate(POPULATE).sort({ createdAt: -1 });
  return pedidos.map((p) => presentar(p, usuario.rol));
}

export async function obtenerPedido(id, usuario) {
  const pedido = await Pedido.findById(id).populate(POPULATE);
  if (!pedido) throw new AppError("Pedido no encontrado.", 404);
  if (usuario.rol === "repartidor" && !esDelRepartidor(pedido, usuario)) throw new AppError("Ese pedido no esta asignado a usted.", 403);
  return presentar(pedido, usuario.rol);
}

export async function crearPedido({ cliente, items }, usuario, io) {
  const datos = await prepararPedido(cliente, items);
  const pedido = await Pedido.create({
    ...datos,
    estado: "Pendiente", // siempre nace Pendiente
    historialEstados: [{ estado: "Pendiente", usuario: usuario._id }],
    creadoPor: usuario._id,
    modificadoPor: usuario._id,
  });
  await registrarAuditoria(usuario, { accion: "CREAR", entidad: "Pedido", entidadId: pedido._id, detalle: `Pedido creado. Total: $${datos.total}.` });
  avisarCambio(io, pedido);
  return presentar(await pedido.populate(POPULATE), usuario.rol);
}

export async function actualizarPedido(id, { cliente, items }, usuario, io) {
  const pedido = await buscarOError(id);
  if (pedido.estado !== "Pendiente") throw new AppError(`Solo se pueden editar pedidos Pendientes (este esta ${pedido.estado}).`, 409);

  const datos = await prepararPedido(cliente, items);
  pedido.set({ ...datos, modificadoPor: usuario._id });
  await pedido.save();
  await registrarAuditoria(usuario, { accion: "MODIFICAR", entidad: "Pedido", entidadId: pedido._id, detalle: `Pedido editado. Nuevo total: $${datos.total}.` });
  avisarCambio(io, pedido);
  return presentar(await pedido.populate(POPULATE), usuario.rol);
}

export async function cambiarEstadoPedido(id, { estado: nuevo, repartidor: repartidorId }, usuario, io) {
  const pedido = await buscarOError(id);
  const actual = pedido.estado;

  // 1) Transicion valida? (Entregado -> Pendiente y Cancelado -> En camino no existen en la tabla)
  const destinos = TRANSICIONES[actual];
  if (!Object.hasOwn(destinos, nuevo)) {
    const permitidas = Object.keys(destinos).join(", ") || "ninguna (estado final)";
    throw new AppError(`Transicion no permitida: ${actual} -> ${nuevo}. Permitidas desde ${actual}: ${permitidas}.`, 409);
  }
  // 1b) El ROL puede hacer ESTE paso? (ej.: el deposito prepara pero no despacha)
  if (!destinos[nuevo].includes(usuario.rol)) {
    throw new AppError(`El rol "${usuario.rol}" no puede pasar un pedido de ${actual} a ${nuevo}. Lo hace: ${destinos[nuevo].join(" o ")}.`, 403);
  }
  // 1c) Un repartidor solo puede cerrar SUS pedidos (no los de otro chofer).
  if (usuario.rol === "repartidor" && !esDelRepartidor(pedido, usuario)) {
    throw new AppError("Solo puede cambiar el estado de los pedidos que tiene asignados.", 403);
  }

  // 2) Despacho: exige un repartidor DISPONIBLE. Se reserva de forma atomica.
  if (nuevo === "En camino") {
    if (!repartidorId) throw new AppError("Para despachar el pedido debe indicar un repartidor.", 400);
    if (!(await Repartidor.exists({ _id: repartidorId }))) throw new AppError("El repartidor indicado no existe.", 404);
    const reservado = await Repartidor.findOneAndUpdate(
      { _id: repartidorId, activo: true, disponible: true },
      { disponible: false, modificadoPor: usuario._id }
    );
    if (!reservado) throw new AppError("El repartidor no esta disponible para recibir pedidos.", 409);
    pedido.repartidor = reservado._id;
  }

  // 3) Al cerrar el pedido (Entregado/Cancelado) el repartidor queda libre.
  if ((nuevo === "Entregado" || nuevo === "Cancelado") && pedido.repartidor) {
    await Repartidor.findByIdAndUpdate(pedido.repartidor, { disponible: true });
  }

  pedido.estado = nuevo;
  pedido.modificadoPor = usuario._id;
  pedido.historialEstados.push({ estado: nuevo, usuario: usuario._id });
  await pedido.save();

  await registrarAuditoria(usuario, { accion: "CAMBIO_ESTADO", entidad: "Pedido", entidadId: pedido._id, detalle: `${actual} -> ${nuevo}` });
  avisarCambio(io, pedido);
  return presentar(await pedido.populate(POPULATE), usuario.rol);
}
