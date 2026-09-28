// ============================================================
// FRESHROUTE - APLICACIÓN PRINCIPAL
// ============================================================
//
// Este archivo configura y pone en funcionamiento el servidor
// Express de FreshRoute.
//
// Arquitectura utilizada:
// Cliente → Routes → Controllers → Models → JSON Storage
//
// Se utiliza MVC para separar responsabilidades.
//
// ============================================================

// Importamos los módulos necesarios de Node.js y Express.
const express = require("express");
const path = require("path");

// ============================================================
// IMPORTACIÓN DE RUTAS
// ============================================================

const clientesRoutes = require("./routes/clientes.routes");
const productosRoutes = require("./routes/productos.routes");
const pedidosRoutes = require("./routes/pedidos.routes");

// ============================================================
// IMPORTACIÓN DE MIDDLEWARES
// ============================================================

const loggerMiddleware = require("./middlewares/logger.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

// ============================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================================

const app = express();

// Puerto donde funcionará el servidor (usa variable de entorno o 3000 por defecto).
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES GENERALES
// ============================================================

// Permite que Express pueda recibir información enviada
// mediante solicitudes cuyo contenido sea JSON.
//
// Por ejemplo, en un POST:
// {
//    "nombre": "Tomate",
//    "precio": 1500
// }
app.use(express.json());

// Permite procesar información enviada mediante formularios (URL-encoded).
app.use(express.urlencoded({ extended: true }));

// Permite servir archivos estáticos (CSS, JS del cliente, imágenes) desde la carpeta /public.
app.use(express.static(path.join(__dirname, "public")));

// Middleware propio para registrar las solicitudes recibidas.
app.use(loggerMiddleware);

// ============================================================
// CONFIGURACIÓN DE PUG (MOTOR DE PLANTILLAS)
// ============================================================

// Indicamos que Pug será el motor de plantillas.
app.set("view engine", "pug");

// Indicamos la ruta absoluta de la carpeta de vistas usando path.
app.set("views", path.join(__dirname, "views"));

// ============================================================
// RUTA PRINCIPAL
// ============================================================

// La ruta "/" utiliza Pug para mostrar una página de presentación.
// No reemplaza a nuestra API REST; solamente permite demostrar
// el uso del motor de plantillas solicitado en la consigna.
app.get("/", (req, res) => {
    res.render("index", {
        titulo: "FreshRoute",
        mensaje: "Sistema de distribución de pedidos"
    });
});

// ============================================================
// RUTAS DE LA API REST
// ============================================================

// Todas las rutas de los módulos principales del sistema:
app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);

// ============================================================
// MANEJO DE RUTAS INEXISTENTES (404)
// ============================================================

// Si ninguna de las rutas anteriores coincide, devolvemos un 404
// indicando además qué URL fue la que falló.
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        ruta: req.originalUrl
    });
});

// ============================================================
// MANEJO DE ERRORES CENTRALIZADO
// ============================================================

// Este middleware recibe los errores internos que se produzcan
// durante la ejecución de los controladores o servicios.
app.use(errorMiddleware);

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
    console.log(
        `FreshRoute ejecutándose en http://localhost:${PORT}`
    );
});