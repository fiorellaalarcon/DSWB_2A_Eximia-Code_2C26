// ============================================================
// RUTAS PRODUCTOS
// ============================================================
//
// Define los endpoints HTTP correspondientes al módulo
// Productos.
//
// La lógica se encuentra en productos.controller.js.
// ============================================================

const express = require("express");

const router = express.Router();

const controller = require("../controllers/productos.controller");

// GET /api/productos
// También permite:
// GET /api/productos?nombre=Tomate
router.get("/", controller.obtenerProductos);

// GET /api/productos/:id
router.get("/:id", controller.obtenerProductoPorId);

// POST /api/productos
router.post("/", controller.crearProducto);

// PUT /api/productos/:id
router.put("/:id", controller.actualizarProducto);

// DELETE /api/productos/:id
router.delete("/:id", controller.eliminarProducto);

module.exports = router;