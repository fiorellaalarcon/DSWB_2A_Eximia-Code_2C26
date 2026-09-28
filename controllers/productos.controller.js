// ============================================================
// CONTROLADOR PRODUCTOS
// ============================================================
//
// Contiene la lógica correspondiente a las solicitudes HTTP
// del módulo Productos.
//
// Responsabilidad:
// - Recibir la solicitud.
// - Validar los datos.
// - Utilizar el modelo Producto.
// - Leer y escribir la información mediante jsonStorage.
// - Devolver las respuestas HTTP correspondientes.
// ============================================================

const Producto = require("../models/Producto");
const { readJson, writeJson } = require("../utils/jsonStorage");

const ARCHIVO = "productos.json";

// ============================================================
// GET /api/productos
// GET /api/productos?nombre=...
// ============================================================

async function obtenerProductos(req, res, next) {

    try {

        let productos = await readJson(ARCHIVO);

        // Permite consultar productos por nombre mediante
        // un parámetro de consulta.
        if (req.query.nombre) {

            const nombreBuscado = req.query.nombre.toLowerCase();

            productos = productos.filter(producto =>
                producto.nombre.toLowerCase().includes(nombreBuscado)
            );
        }

        res.status(200).json(productos);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// GET /api/productos/:id
// ============================================================

async function obtenerProductoPorId(req, res, next) {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "El ID del producto debe ser un número entero."
            });
        }

        const productos = await readJson(ARCHIVO);

        const producto = productos.find(
            producto => producto.id === id
        );

        if (!producto) {
            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        res.status(200).json(producto);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// POST /api/productos
// ============================================================

async function crearProducto(req, res, next) {

    try {

        const { nombre, precio } = req.body;

        // Validaciones básicas.
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            return res.status(400).json({
                error: "El nombre del producto es obligatorio."
            });
        }

        if (
            typeof precio !== "number" ||
            Number.isNaN(precio) ||
            precio <= 0
        ) {
            return res.status(400).json({
                error: "El precio debe ser un número mayor a cero."
            });
        }

        const productos = await readJson(ARCHIVO);

        // Generamos un ID correlativo.
        const nuevoId = productos.length > 0
            ? Math.max(...productos.map(producto => producto.id)) + 1
            : 1;

        const nuevoProducto = new Producto(
            nuevoId,
            nombre,
            precio
        );

        productos.push(nuevoProducto);

        await writeJson(ARCHIVO, productos);

        res.status(201).json(nuevoProducto);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// PUT /api/productos/:id
// ============================================================

async function actualizarProducto(req, res, next) {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "El ID del producto debe ser un número entero."
            });
        }

        const { nombre, precio } = req.body;

        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            return res.status(400).json({
                error: "El nombre del producto es obligatorio."
            });
        }

        if (
            typeof precio !== "number" ||
            Number.isNaN(precio) ||
            precio <= 0
        ) {
            return res.status(400).json({
                error: "El precio debe ser un número mayor a cero."
            });
        }

        const productos = await readJson(ARCHIVO);

        const indice = productos.findIndex(
            producto => producto.id === id
        );

        if (indice === -1) {
            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        const productoActualizado = new Producto(
            id,
            nombre,
            precio
        );

        productos[indice] = productoActualizado;

        await writeJson(ARCHIVO, productos);

        res.status(200).json(productoActualizado);

    } catch (error) {
        next(error);
    }
}

// ============================================================
// DELETE /api/productos/:id
// ============================================================

async function eliminarProducto(req, res, next) {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "El ID del producto debe ser un número entero."
            });
        }

        const productos = await readJson(ARCHIVO);

        const indice = productos.findIndex(
            producto => producto.id === id
        );

        if (indice === -1) {
            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        const eliminado = productos.splice(indice, 1)[0];

        await writeJson(ARCHIVO, productos);

        res.status(200).json({
            mensaje: "Producto eliminado correctamente.",
            producto: eliminado
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};