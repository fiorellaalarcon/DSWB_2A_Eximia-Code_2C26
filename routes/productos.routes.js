const { Router } = require("express");

const router = Router();

const {
    obtenerProductos,
    obtenerProductoPorId,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
} = require("../controllers/productos.controller.js");

router.get("/", obtenerProductos);

router.get("/:id", obtenerProductoPorId);

router.post("/", agregarProducto);

router.put("/:id", actualizarProducto);

router.delete("/:id", eliminarProducto);




module.exports = router;
