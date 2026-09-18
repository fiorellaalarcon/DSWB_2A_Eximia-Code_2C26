const Producto = require("../models/Producto");

const manager = new Producto("./data/productos.json");

const obtenerProductos = async (req, res) => {
    try {
        const productos = await manager.mostrarProductos();

        const { nombre } = req.query;

        // Si viene ?nombre=...
        if (nombre) {
            const productosFiltrados = productos.filter(
                (producto) =>
                    producto.nombre.toLowerCase().includes(nombre.toLowerCase())
            );

            return res.status(200).json(productosFiltrados);
        }

        // Si no viene query param, devuelve todos
        res.status(200).json(productos);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener los productos"
        });
    }
};

const obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await manager.obtenerProductoPorId(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json(producto);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener el producto"
        });
    }
};

const agregarProducto = async (req, res) => {
   const agregarProducto = async (req, res) => {
    try {
        const { nombre, precio, categoria, stock, imagen } = req.body;

        // Validar que todos los campos estén completos
        if (!nombre || !precio || !categoria || !stock || !imagen) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        // Validar que precio y stock sean números
        if (isNaN(precio) || isNaN(stock)) {
            return res.status(400).json({
                mensaje: "El precio y el stock deben ser números"
            });
        }

        // Crear el producto
        const producto = {
            nombre,
            precio: Number(precio),
            categoria,
            stock: Number(stock),
            imagen
        };

        // Guardar el producto
        const productoCreado = await manager.addProductos(producto);

        // Devolver el recurso creado
        res.status(201).json(productoCreado);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al agregar el producto"
        });
    }
};
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        const producto = await manager.updateProductos(id, datos);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Producto actualizado correctamente",
            producto
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar el producto"
        });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await manager.deleteProductos(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Producto eliminado correctamente",
            producto
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar el producto"
        });
    }
};

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
};