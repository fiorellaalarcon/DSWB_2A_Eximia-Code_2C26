// ============================================================
// LOGGER MIDDLEWARE
// ============================================================
//
// Este middleware registra en la consola cada solicitud
// recibida por el servidor.
//
// Se utiliza para demostrar el concepto de middleware
// solicitado en el parcial.
// ============================================================

function logger(req, res, next) {

    // Obtenemos la fecha y hora actual.
    const fecha = new Date().toISOString();

    // Mostramos método HTTP y URL solicitada.
    console.log(
        `[${fecha}] ${req.method} ${req.originalUrl}`
    );

    // next() permite continuar con el siguiente middleware
    // o con la ruta correspondiente.
    next();
}

module.exports = logger;