// ============================================================
// MIDDLEWARE LOGGER
// ============================================================
//
// Registra en consola el método HTTP y la URL de cada
// solicitud recibida.
// ============================================================

function logger(req, res, next) {

    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );

    next();
}

module.exports = logger;