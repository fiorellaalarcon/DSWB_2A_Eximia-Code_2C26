const path = require("path");

const Pedido = require("../models/Pedido");
const { leerJSON, guardarJSON } = require("../utils/jsonStorage");

const ARCHIVO_PEDIDOS = path.join(__dirname, "../data/pedidos.json");

// ============================================================
// OBTENER TODOS LOS PEDIDOS
// ============================================================

function obtenerPedidos(req, res, next) {

    try {

        let pedidos = leerJSON(ARCHIVO_PEDIDOS);

        const { clienteId, estado } = req.query;

        if (clienteId) {
            pedidos = pedidos.filter(
                pedido => pedido.clienteId === Number(clienteId)
            );
        }

        if (estado) {
            pedidos = pedidos.filter(
                pedido => pedido.estado === estado
            );
        }

        res.status(200).json(pedidos);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// OBTENER PEDIDO POR ID
// ============================================================

function obtenerPedidoPorId(req, res, next) {

    try {

        const pedidos = leerJSON(ARCHIVO_PEDIDOS);

        const pedido = pedidos.find(
            pedido => pedido.id === Number(req.params.id)
        );

        if (!pedido) {
            return res.status(404).json({
                error: "Pedido no encontrado"
            });
        }

        res.status(200).json(pedido);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// CREAR PEDIDO
// ============================================================

function crearPedido(req, res, next) {

    try {

        const pedidos = leerJSON(ARCHIVO_PEDIDOS);

        const { clienteId, productos } = req.body;

        const nuevoId = pedidos.length > 0
            ? Math.max(...pedidos.map(pedido => pedido.id)) + 1
            : 1;

        const nuevoPedido = new Pedido(
            nuevoId,
            clienteId,
            productos
        );

        pedidos.push(nuevoPedido);

        guardarJSON(ARCHIVO_PEDIDOS, pedidos);

        res.status(201).json(nuevoPedido);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// ACTUALIZAR PEDIDO
// ============================================================

function actualizarPedido(req, res, next) {

    try {

        const pedidos = leerJSON(ARCHIVO_PEDIDOS);

        const indice = pedidos.findIndex(
            pedido => pedido.id === Number(req.params.id)
        );

        if (indice === -1) {
            return res.status(404).json({
                error: "Pedido no encontrado"
            });
        }

        pedidos[indice] = {
            ...pedidos[indice],
            ...req.body
        };

        guardarJSON(ARCHIVO_PEDIDOS, pedidos);

        res.status(200).json(pedidos[indice]);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// ELIMINAR PEDIDO
// ============================================================

function eliminarPedido(req, res, next) {

    try {

        const pedidos = leerJSON(ARCHIVO_PEDIDOS);

        const indice = pedidos.findIndex(
            pedido => pedido.id === Number(req.params.id)
        );

        if (indice === -1) {
            return res.status(404).json({
                error: "Pedido no encontrado"
            });
        }

        const pedidoEliminado = pedidos.splice(indice, 1)[0];

        guardarJSON(ARCHIVO_PEDIDOS, pedidos);

        res.status(200).json(pedidoEliminado);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// CAMBIAR ESTADO
// ============================================================

function cambiarEstadoPedido(req, res, next) {

    try {

        const pedidos = leerJSON(ARCHIVO_PEDIDOS);

        const indice = pedidos.findIndex(
            pedido => pedido.id === Number(req.params.id)
        );

        if (indice === -1) {
            return res.status(404).json({
                error: "Pedido no encontrado"
            });
        }

        const pedido = new Pedido(
            pedidos[indice].id,
            pedidos[indice].clienteId,
            pedidos[indice].productos,
            pedidos[indice].estado,
            pedidos[indice].fecha
        );

        pedido.cambiarEstado(req.body.estado);

        pedidos[indice] = pedido;

        guardarJSON(ARCHIVO_PEDIDOS, pedidos);

        res.status(200).json(pedido);

    } catch (error) {

        if (
            error.message === "Estado no válido" ||
            error.message.includes("no puede")
        ) {
            return res.status(400).json({
                error: error.message
            });
        }

        next(error);
    }
}

// ============================================================
// EXPORTAR CONTROLADORES
// ============================================================

module.exports = {
    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    cambiarEstadoPedido
};