// ============================================================
// FRESHROUTE - APLICACIÓN PRINCIPAL
// ============================================================
//
// Este archivo configura y pone en funcionamiento el servidor
// Express de FreshRoute.
//
// Arquitectura utilizada:
// Cliente → Routes → Controllers → Models → JSON
//
// Se utiliza MVC para separar responsabilidades.
//
// ============================================================

// Importamos Express.
// Express permite crear el servidor y definir las rutas HTTP.
const express = require("express");

// Importamos las rutas correspondientes a cada módulo.
//const clientesRoutes = require("./routes/clientes.routes");
const productosRoutes = require("./routes/productos.routes");
//const pedidosRoutes = require("./routes/pedidos.routes");

// Importamos nuestros middlewares.
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/error.js");

// Creamos la aplicación Express.
const app = express();

// Puerto donde funcionará el servidor.
const PORT = 3000;

// ============================================================
// MIDDLEWARES GENERALES
// ============================================================

// Permite que Express pueda recibir información enviada
// mediante solicitudes cuyo contenido sea JSON.
//
// Por ejemplo, en un POST:
// {
//   "nombre": "Tomate",
//   "precio": 1500
// }
app.use(express.json());

// Permite procesar información enviada mediante formularios.
app.use(express.urlencoded({ extended: true }));

// Middleware propio para registrar las solicitudes recibidas.
app.use(logger);

// ============================================================
// CONFIGURACIÓN DE PUG
// ============================================================

// Indicamos que Pug será el motor de plantillas.
app.set("view engine", "pug");

// Indicamos la carpeta donde se encuentran las vistas.
app.set("views", "./views");

// ============================================================
// RUTA PRINCIPAL
// ============================================================

// La ruta "/" utiliza Pug para mostrar una página sencilla.
// No reemplaza a nuestra API REST; solamente permite demostrar
// el uso del motor de plantillas solicitado en la consigna.
app.get("/", (req, res) => {

    res.render("index", {
        titulo: "FreshRoute",
        mensaje: "Sistema de distribución de pedidos"
    });

});

// ============================================================
// RUTAS DE LA API
// ============================================================

// Todas las rutas relacionadas con clientes comenzarán con:
// /api/clientes
//app.use("/api/clientes", clientesRoutes);

// Todas las rutas relacionadas con productos comenzarán con:
// /api/productos
app.use("/api/productos", productosRoutes);

// Todas las rutas relacionadas con pedidos comenzarán con:
// /api/pedidos
//app.use("/api/pedidos", pedidosRoutes);

// ============================================================
// MANEJO DE RUTAS INEXISTENTES
// ============================================================

// Si ninguna de las rutas anteriores coincide con la solicitud,
// devolvemos un código HTTP 404.
app.use((req, res) => {

    res.status(404).json({
        error: "Ruta no encontrada"
    });

});

// ============================================================
// MANEJO DE ERRORES
// ============================================================

// Este middleware recibe los errores que se produzcan
// durante la ejecución de la aplicación.
app.use(errorHandler);

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {

    console.log(
        `FreshRoute ejecutándose en http://localhost:${PORT}`
    );

});