// ============================================================
// ERROR HANDLER
// ============================================================
//
// Middleware encargado de manejar errores internos de la
// aplicación.
//
// Las validaciones específicas de cada recurso se realizan
// dentro de sus respectivos controllers, de acuerdo con la
// aclaración realizada por el docente.
// ============================================================

function errorHandler(err, req, res, next) {

    // Mostramos el error en la consola para facilitar
    // la detección de problemas durante el desarrollo.
    console.error(err);

    // Respondemos al cliente utilizando el código HTTP 500.
    res.status(500).json({
        error: "Error interno del servidor"
    });
}

module.exports = errorHandler;