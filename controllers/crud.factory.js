// ============================================================
// FABRICA DE CONTROLADORES CRUD CON BAJA LOGICA (NUEVO)
// ============================================================
// Clientes, Productos y Repartidores comparten el mismo
// comportamiento: listar activos, obtener, crear, editar, dar de
// baja (activo=false) y reactivar, siempre auditando. Para no
// repetir el mismo codigo 3 veces (redundancia) se escribe una vez
// aqui y cada modulo lo configura con sus propias reglas.
// ============================================================
import { AppError } from "../utils/AppError.js";
import { manejarAsync } from "../utils/manejarAsync.js";
import { filtroActivo } from "../utils/consultas.js";
import { registrarAuditoria } from "../services/auditoria.service.js";

/**
 * @param {object}   cfg
 * @param {Model}    cfg.Modelo            modelo de Mongoose
 * @param {string}   cfg.entidad           nombre para mensajes/auditoria ("Cliente")
 * @param {string[]} cfg.campos            campos que el usuario PUEDE enviar (lista blanca)
 * @param {Function} [cfg.filtroExtra]     (req) => filtro adicional por query params
 * @param {Function} [cfg.verificarBaja]   async (doc) => lanza AppError si no se puede dar de baja
 */
export function crearControladorCrud({ Modelo, entidad, campos, filtroExtra, verificarBaja }) {
  // Copia solo los campos permitidos del body (evita que el cliente
  // envie "activo", "creadoPor", etc. -> proteccion contra mass assignment).
  const tomarCampos = (body) =>
    Object.fromEntries(campos.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));

  const buscarOError = async (id) => {
    const doc = await Modelo.findById(id);
    if (!doc) throw new AppError(`${entidad} no encontrado.`, 404);
    return doc;
  };

  return {
    // GET /api/<modulo>  (+ filtros por query)
    listar: manejarAsync(async (req, res) => {
      const filtro = { ...filtroActivo(req), ...(filtroExtra ? filtroExtra(req) : {}) };
      const docs = await Modelo.find(filtro).sort({ createdAt: -1 });
      res.status(200).json(docs);
    }),

    // GET /api/<modulo>/:id
    obtener: manejarAsync(async (req, res) => {
      res.status(200).json(await buscarOError(req.params.id));
    }),

    // POST /api/<modulo>
    crear: manejarAsync(async (req, res) => {
      const doc = await Modelo.create({
        ...tomarCampos(req.body),
        creadoPor: req.usuario._id,
        modificadoPor: req.usuario._id,
      });
      await registrarAuditoria(req.usuario, { accion: "CREAR", entidad, entidadId: doc._id, detalle: `Alta de ${entidad}.` });
      res.status(201).json(doc);
    }),

    // PUT /api/<modulo>/:id
    actualizar: manejarAsync(async (req, res) => {
      const doc = await buscarOError(req.params.id);
      if (!doc.activo) throw new AppError(`No se puede editar un ${entidad} inactivo.`, 409);

      const cambios = tomarCampos(req.body);
      // Detectamos que campos cambiaron realmente (para auditar).
      const modificados = Object.keys(cambios).filter((c) => String(doc[c]) !== String(cambios[c]));

      doc.set(cambios);
      doc.modificadoPor = req.usuario._id;
      await doc.save(); // save() ejecuta validaciones del esquema y actualiza updatedAt

      await registrarAuditoria(req.usuario, {
        accion: "MODIFICAR", entidad, entidadId: doc._id,
        detalle: modificados.length ? `Campos modificados: ${modificados.join(", ")}.` : "Sin cambios.",
      });
      res.status(200).json(doc);
    }),

    // DELETE /api/<modulo>/:id  -> BAJA LOGICA (no borra el documento)
    darDeBaja: manejarAsync(async (req, res) => {
      const doc = await buscarOError(req.params.id);
      if (!doc.activo) throw new AppError(`El ${entidad} ya esta inactivo.`, 409);
      if (verificarBaja) await verificarBaja(doc); // regla de negocio propia del modulo

      doc.activo = false;
      doc.modificadoPor = req.usuario._id;
      await doc.save();
      await registrarAuditoria(req.usuario, { accion: "BAJA", entidad, entidadId: doc._id, detalle: `${entidad} dado de baja (inactivo).` });
      res.status(200).json({ mensaje: `${entidad} dado de baja correctamente.`, [entidad.toLowerCase()]: doc });
    }),

    // PATCH /api/<modulo>/:id/reactivar
    reactivar: manejarAsync(async (req, res) => {
      const doc = await buscarOError(req.params.id);
      if (doc.activo) throw new AppError(`El ${entidad} ya esta activo.`, 409);
      doc.activo = true;
      doc.modificadoPor = req.usuario._id;
      await doc.save();
      await registrarAuditoria(req.usuario, { accion: "REACTIVAR", entidad, entidadId: doc._id, detalle: `${entidad} reactivado.` });
      res.status(200).json({ mensaje: `${entidad} reactivado correctamente.`, [entidad.toLowerCase()]: doc });
    }),
  };
}