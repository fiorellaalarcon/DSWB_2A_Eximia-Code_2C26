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

router.get("/", obtenerPedidos);
router.get("/:id", obtenerPedidoPorId);

router.post("/", crearPedido);
router.put("/:id", actualizarPedido);
router.delete("/:id", eliminarPedido);

router.patch("/:id/estado", cambiarEstadoPedido);

module.exports = router;