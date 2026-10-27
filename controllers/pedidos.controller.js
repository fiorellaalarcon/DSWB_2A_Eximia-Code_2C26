// ============================================================
// CONTROLADOR PEDIDOS
// ============================================================
// CAMBIOS vs 1ra entrega:
//  - Mongoose + populate() en vez de JSON y busquedas manuales.
//  - Validaciones de formato -> middlewares (validaciones.middleware.js).
//    Aqui quedan las REGLAS DE NEGOCIO (existencia, estados, repartidor).
//  - DELETE se reemplaza por CANCELAR (cambio de estado): el pedido
//    se conserva como historial.
//  - Transiciones validadas con la tabla TRANSICIONES del modelo, que ademas
//    dice QUE ROL puede hacer cada paso (deposito, planificador, administrativo).
//  - Despacho: solo un repartidor DISPONIBLE puede recibir el pedido.
//  - Auditoria + historialEstados de cada cambio.
// ============================================================
import mongoose from "mongoose";
import { Pedido, ESTADOS_PEDIDO, TRANSICIONES, siguientesPermitidos } from "../models/Pedido.js";
import { Cliente } from "../models/Cliente.js";
import { Producto } from "../models/Producto.js";
import { Repartidor } from "../models/Repartidor.js";
import { AppError } from "../utils/AppError.js";
import { manejarAsync } from "../utils/manejarAsync.js";
import { registrarAuditoria } from "../services/auditoria.service.js";

// Datos relacionados que se "pegan" a cada pedido en las respuestas.
const POPULATE = [
  { path: "cliente", select: "nombre direccion" },
  { path: "repartidor", select: "nombre patente" },
  { path: "items.producto", select: "nombre" },
];

// Verifica existencia del cliente y de los productos (regla: "existencia
// de registros relacionados") y arma los items con precio congelado.
async function prepararPedido(clienteId, itemsEntrada) {
  const cliente = await Cliente.findById(clienteId);
  if (!cliente) throw new AppError("El cliente indicado no existe.", 404);
  if (!cliente.activo) throw new AppError("El cliente indicado esta inactivo.", 409);

  const items = [];
  for (const { producto: productoId, cantidad } of itemsEntrada) {
    const producto = await Producto.findById(productoId);
    if (!producto) throw new AppError(`El producto ${productoId} no existe.`, 404);
    if (!producto.activo) throw new AppError(`El producto "${producto.nombre}" esta inactivo.`, 409);
    items.push({ producto: producto._id, cantidad, precioUnitario: producto.precio });
  }
  const total = items.reduce((suma, i) => suma + i.cantidad * i.precioUnitario, 0);
  return { cliente: cliente._id, items, total };
}

// Convierte el pedido a JSON y le agrega "siguientesEstados": SOLO los pasos que
// el rol de quien consulta puede hacer (el frontend muestra esos botones).
const presentar = (pedido, rol) => ({
  ...pedido.toJSON(),
  siguientesEstados: siguientesPermitidos(pedido.estado, rol),
});

// El pedido tiene asignado a este usuario-repartidor? (acepta repartidor poblado o solo id)
const esDelRepartidor = (pedido, usuario) =>
  Boolean(pedido.repartidor) &&
  Boolean(usuario.repartidor) &&
  String(pedido.repartidor._id ?? pedido.repartidor) === String(usuario.repartidor);

const buscarOError = async (id) => {
  const pedido = await Pedido.findById(id);
  if (!pedido) throw new AppError("Pedido no encontrado.", 404);
  return pedido;
};

// GET /api/pedidos?cliente=<id>&estado=Pendiente   (consultas por cliente y estado)
export const listar = manejarAsync(async (req, res) => {
  const filtro = {};
  if (req.query.cliente !== undefined) {
    if (!mongoose.isValidObjectId(req.query.cliente))
      throw new AppError("El parametro cliente no es un id valido.", 400);
    filtro.cliente = req.query.cliente;
  }
  if (req.query.estado !== undefined) {
    if (!ESTADOS_PEDIDO.includes(req.query.estado))
      throw new AppError(`Estado invalido. Valores: ${ESTADOS_PEDIDO.join(", ")}.`, 400);
    filtro.estado = req.query.estado;
  }
  // El repartidor solo ve los pedidos que tiene asignados.
  if (req.usuario.rol === "repartidor") {
    if (!req.usuario.repartidor) return res.status(200).json([]);
    filtro.repartidor = req.usuario.repartidor;
  }
  const pedidos = await Pedido.find(filtro).populate(POPULATE).sort({ createdAt: -1 });
  res.status(200).json(pedidos.map((p) => presentar(p, req.usuario.rol)));
});

// GET /api/pedidos/:id
export const obtener = manejarAsync(async (req, res) => {
  const pedido = await Pedido.findById(req.params.id).populate(POPULATE);
  if (!pedido) throw new AppError("Pedido no encontrado.", 404);
  if (req.usuario.rol === "repartidor" && !esDelRepartidor(pedido, req.usuario))
    throw new AppError("Ese pedido no esta asignado a usted.", 403);
  res.status(200).json(presentar(pedido, req.usuario.rol));
});

// POST /api/pedidos  -> siempre nace "Pendiente"
export const crear = manejarAsync(async (req, res) => {
  const datos = await prepararPedido(req.body.cliente, req.body.items);
  const pedido = await Pedido.create({
    ...datos,
    estado: "Pendiente",
    historialEstados: [{ estado: "Pendiente", usuario: req.usuario._id }],
    creadoPor: req.usuario._id,
    modificadoPor: req.usuario._id,
  });
  await registrarAuditoria(req.usuario, { accion: "CREAR", entidad: "Pedido", entidadId: pedido._id, detalle: `Pedido creado. Total: $${datos.total}.` });
  res.status(201).json(presentar(await pedido.populate(POPULATE), req.usuario.rol));
});

// PUT /api/pedidos/:id  -> solo se edita mientras este "Pendiente"
export const actualizar = manejarAsync(async (req, res) => {
  const pedido = await buscarOError(req.params.id);
  if (pedido.estado !== "Pendiente")
    throw new AppError(`Solo se pueden editar pedidos Pendientes (este esta ${pedido.estado}).`, 409);

  const datos = await prepararPedido(req.body.cliente, req.body.items);
  pedido.set({ ...datos, modificadoPor: req.usuario._id });
  await pedido.save();
  await registrarAuditoria(req.usuario, { accion: "MODIFICAR", entidad: "Pedido", entidadId: pedido._id, detalle: `Pedido editado. Nuevo total: $${datos.total}.` });
  res.status(200).json(presentar(await pedido.populate(POPULATE), req.usuario.rol));
});

// PATCH /api/pedidos/:id/estado   body: { estado, repartidor? }
export const cambiarEstado = manejarAsync(async (req, res) => {
  const pedido = await buscarOError(req.params.id);
  const { estado: nuevo, repartidor: repartidorId } = req.body;
  const actual = pedido.estado;

  // 1) Transicion valida? (Entregado -> Pendiente y Cancelado -> En camino no existen en la tabla)
  const destinos = TRANSICIONES[actual];
  if (!Object.hasOwn(destinos, nuevo)) {
    const permitidas = Object.keys(destinos).join(", ") || "ninguna (estado final)";
    throw new AppError(`Transicion no permitida: ${actual} -> ${nuevo}. Permitidas desde ${actual}: ${permitidas}.`, 409);
  }

  // 1b) El ROL puede hacer ESTE paso? (ej.: el deposito prepara pero no despacha)
  if (!destinos[nuevo].includes(req.usuario.rol)) {
    throw new AppError(
      `El rol "${req.usuario.rol}" no puede pasar un pedido de ${actual} a ${nuevo}. Lo hace: ${destinos[nuevo].join(" o ")}.`,
      403
    );
  }

  // 1c) Un repartidor solo puede cerrar SUS pedidos (no los de otro chofer).
  if (req.usuario.rol === "repartidor" && !esDelRepartidor(pedido, req.usuario)) {
    throw new AppError("Solo puede cambiar el estado de los pedidos que tiene asignados.", 403);
  }

  // 2) Despacho: exige un repartidor DISPONIBLE. Se reserva de forma atomica.
  if (nuevo === "En camino") {
    if (!repartidorId) throw new AppError("Para despachar el pedido debe indicar un repartidor.", 400);
    const existe = await Repartidor.findById(repartidorId);
    if (!existe) throw new AppError("El repartidor indicado no existe.", 404);

    const reservado = await Repartidor.findOneAndUpdate(
      { _id: repartidorId, activo: true, disponible: true },
      { disponible: false, modificadoPor: req.usuario._id }
    );
    if (!reservado) throw new AppError("El repartidor no esta disponible para recibir pedidos.", 409);
    pedido.repartidor = reservado._id;
  }

  // 3) Al cerrar el pedido (Entregado/Cancelado) el repartidor queda libre.
  if ((nuevo === "Entregado" || nuevo === "Cancelado") && pedido.repartidor) {
    await Repartidor.findByIdAndUpdate(pedido.repartidor, { disponible: true });
  }

  pedido.estado = nuevo;
  pedido.modificadoPor = req.usuario._id;
  pedido.historialEstados.push({ estado: nuevo, usuario: req.usuario._id });
  await pedido.save();

  await registrarAuditoria(req.usuario, { accion: "CAMBIO_ESTADO", entidad: "Pedido", entidadId: pedido._id, detalle: `${actual} -> ${nuevo}` });
  res.status(200).json({ mensaje: "Estado actualizado correctamente.", pedido: presentar(await pedido.populate(POPULATE), req.usuario.rol) });
});
