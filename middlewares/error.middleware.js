// ============================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================================
//
// Recibe los errores derivados de los controladores y evita
// repetir la misma lógica de respuesta en cada ruta.
// ============================================================

function errorHandler(error, req, res, next) {

    console.error(error);

    res.status(500).json({
        error: "Error interno del servidor."
    });
}

module.exports = errorHandler;