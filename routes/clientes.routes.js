// ============================================================
// RUTAS DE CLIENTES
// ============================================================
//
// Define los endpoints REST del módulo Clientes.
//
// La lógica de cada operación se encuentra en:
// controllers/clientes.controller.js
// ============================================================

const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/clientes.controller");

// ============================================================
// GET
// ============================================================

// GET /api/clientes
router.get("/", controller.listar);

// GET /api/clientes/:id
router.get("/:id", controller.obtenerPorId);

// ============================================================
// POST
// ============================================================

// POST /api/clientes
router.post("/", controller.crear);

// ============================================================
// PUT
// ============================================================

// PUT /api/clientes/:id
router.put("/:id", controller.actualizar);

// ============================================================
// DELETE
// ============================================================

// DELETE /api/clientes/:id
router.delete("/:id", controller.eliminar);

module.exports = router;
