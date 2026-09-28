// ============================================================
// RUTAS DE PEDIDOS
// ============================================================

const express = require("express");

const {
    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    cambiarEstadoPedido
} = require("../controllers/pedidos.controller");

const router = express.Router();

// ============================================================
// RUTAS GET
// ============================================================

// Obtener todos los pedidos
// También permite consultar por clienteId o estado
router.get("/", obtenerPedidos);

// Obtener un pedido por ID
router.get("/:id", obtenerPedidoPorId);

// ============================================================
// RUTAS POST, PUT Y DELETE
// ============================================================

// Crear un pedido
router.post("/", crearPedido);

// Actualizar un pedido
router.put("/:id", actualizarPedido);

// Eliminar un pedido
router.delete("/:id", eliminarPedido);

// ============================================================
// RUTA PATCH - CAMBIAR ESTADO
// ============================================================

// Cambiar el estado de un pedido
// IMPORTANTE: esta ruta debe estar antes de /:id
router.patch("/:id/estado", cambiarEstadoPedido);

// ============================================================
// EXPORTAR ROUTER
// ============================================================

module.exports = router;

