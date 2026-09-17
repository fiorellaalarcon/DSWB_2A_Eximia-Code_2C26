// ============================================================
// RUTAS DE CLIENTES
// ============================================================
//
// Este archivo define las rutas HTTP del recurso Clientes.
//
// La ruta base se establece en app.js:
//
// /api/clientes
//
// Por lo tanto:
// GET    /api/clientes
// GET    /api/clientes/:id
// POST   /api/clientes
// PUT    /api/clientes/:id
// DELETE /api/clientes/:id
// ============================================================

const express = require("express");

const router = express.Router();

const controller = require("../controllers/clientes.controller");

// Obtener todos.
router.get("/", controller.obtenerClientes);

// Obtener por ID.
router.get("/:id", controller.obtenerClientePorId);

// Crear.
router.post("/", controller.crearCliente);

// Actualizar.
router.put("/:id", controller.actualizarCliente);

// Eliminar.
router.delete("/:id", controller.eliminarCliente);

module.exports = router;
