// ============================================================
// CONTROLLER DE PEDIDOS
// ============================================================
// Contiene la lógica de negocio relacionada con los pedidos.
//
// En este módulo se implementan:
// - CRUD.
// - Validaciones.
// - Estados.
// - Transiciones de estado.
// - Consultas por cliente.
// - Consultas por estado.
// - Verificación de existencia de clientes y productos.
// ============================================================

const fs = require("fs");
const path = require("path");
const Pedido = require("../models/Pedido");

// ============================================================
// ARCHIVOS JSON UTILIZADOS COMO PERSISTENCIA
// ============================================================

const pedidosArchivo = path.join(
    __dirname,
    "../data/pedidos.json"
);

const clientesArchivo = path.join(
    __dirname,
    "../data/clientes.json"
);

const productosArchivo = path.join(
    __dirname,
    "../data/productos.json"
);

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function leerJSON(archivo) {
    const datos = fs.readFileSync(
        archivo,
        "utf-8"
    );

    return JSON.parse(datos);
}

function guardarJSON(archivo, datos) {
    fs.writeFileSync(
        archivo,
        JSON.stringify(datos, null, 4)
    );
}

// ============================================================
// ESTADOS PERMITIDOS
// ============================================================

const ESTADOS_VALIDOS = [
    "Pendiente",
    "Preparado",
    "En camino",
    "Entregado",
    "Cancelado"
];

// ============================================================
// GET TODOS / CONSULTAS
// ============================================================

function obtenerPedidos(req, res) {
    let pedidos = leerJSON(pedidosArchivo);

    // --------------------------------------------------------
    // CONSULTA POR CLIENTE
    // GET /api/pedidos?clienteId=1
    // --------------------------------------------------------

    if (req.query.clienteId) {
        const clienteId = Number(req.query.clienteId);

        pedidos = pedidos.filter(
            pedido => pedido.clienteId === clienteId
        );
    }

    // --------------------------------------------------------
    // CONSULTA POR ESTADO
    // GET /api/pedidos?estado=Pendiente
    // --------------------------------------------------------

    if (req.query.estado) {
        pedidos = pedidos.filter(
            pedido => pedido.estado === req.query.estado
        );
    }

    res.status(200).json(pedidos);
}

// ============================================================
// GET POR ID
// ============================================================

function obtenerPedidoPorId(req, res) {
    const id = Number(req.params.id);
    const pedidos = leerJSON(pedidosArchivo);

    const pedido = pedidos.find(
        pedido => pedido.id === id
    );

    if (!pedido) {
        return res.status(404).json({
            error: "Pedido no encontrado"
        });
    }

    res.status(200).json(pedido);
}

// ============================================================
// CREAR PEDIDO - POST
// ============================================================

function crearPedido(req, res) {
    const { clienteId, productos } = req.body;

    // --------------------------------------------------------
    // VALIDAR CLIENTE
    // --------------------------------------------------------

    if (!clienteId) {
        return res.status(400).json({
            error: "El pedido debe estar asociado a un cliente"
        });
    }

    // --------------------------------------------------------
    // VALIDAR PRODUCTOS
    // --------------------------------------------------------

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            error: "El pedido debe contener al menos un producto"
        });
    }
        // --------------------------------------------------------
    // LEER CLIENTES, PRODUCTOS Y PEDIDOS
    // --------------------------------------------------------

    const clientes = leerJSON(clientesArchivo);
    const productosDisponibles = leerJSON(productosArchivo);
    const pedidos = leerJSON(pedidosArchivo);

    // --------------------------------------------------------
    // VERIFICAR QUE EL CLIENTE EXISTA
    // --------------------------------------------------------

    const clienteExiste = clientes.some(
        cliente => cliente.id === Number(clienteId)
    );

    if (!clienteExiste) {
        return res.status(404).json({
            error: "El cliente indicado no existe"
        });
    }
        // --------------------------------------------------------
    // VERIFICAR PRODUCTOS Y CANTIDADES
    // --------------------------------------------------------

    for (const item of productos) {

        const productoExiste = productosDisponibles.some(
            producto => producto.id === Number(item.productoId)
        );

        if (!productoExiste) {
            return res.status(404).json({
                error: `El producto ${item.productoId} no existe`
            });
        }

        if (
            typeof item.cantidad !== "number" ||
            item.cantidad <= 0
        ) {
            return res.status(400).json({
                error: "La cantidad de cada producto debe ser mayor a cero"
            });
        }
    }
        // --------------------------------------------------------
    // GENERAR ID DEL NUEVO PEDIDO
    // --------------------------------------------------------

    const nuevoId =
        pedidos.length > 0
            ? Math.max(...pedidos.map(p => p.id)) + 1
            : 1;

    // --------------------------------------------------------
    // CREAR NUEVO PEDIDO
    // --------------------------------------------------------

    const nuevoPedido = new Pedido(
        nuevoId,
        Number(clienteId),
        productos,
        "Pendiente"
    );

    // --------------------------------------------------------
    // GUARDAR PEDIDO
    // --------------------------------------------------------

    pedidos.push(nuevoPedido);

    guardarJSON(
        pedidosArchivo,
        pedidos
    );

    // --------------------------------------------------------
    // RESPUESTA
    // --------------------------------------------------------

    res.status(201).json(nuevoPedido);
}

// ============================================================
// ACTUALIZAR PEDIDO - PUT
// ============================================================

function actualizarPedido(req, res) {
    const id = Number(req.params.id);

    const { clienteId, productos } = req.body;

    const pedidos = leerJSON(pedidosArchivo);

    const indice = pedidos.findIndex(
        pedido => pedido.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            error: "Pedido no encontrado"
        });
    }

    // --------------------------------------------------------
    // VALIDAR CLIENTE
    // --------------------------------------------------------

    if (!clienteId) {
        return res.status(400).json({
            error: "El pedido debe estar asociado a un cliente"
        });
    }

    // --------------------------------------------------------
    // VALIDAR PRODUCTOS
    // --------------------------------------------------------

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            error: "El pedido debe contener al menos un producto"
        });
    }

    // --------------------------------------------------------
    // ACTUALIZAR PEDIDO
    // --------------------------------------------------------

    pedidos[indice] = {
        ...pedidos[indice],
        clienteId: Number(clienteId),
        productos: productos
    };

    guardarJSON(
        pedidosArchivo,
        pedidos
    );

    res.status(200).json(pedidos[indice]);
}

// ============================================================
// ELIMINAR PEDIDO - DELETE
// ============================================================

function eliminarPedido(req, res) {
    const id = Number(req.params.id);

    const pedidos = leerJSON(pedidosArchivo);

    const indice = pedidos.findIndex(
        pedido => pedido.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            error: "Pedido no encontrado"
        });
    }

    pedidos.splice(indice, 1);

    guardarJSON(
        pedidosArchivo,
        pedidos
    );

    res.status(200).json({
        mensaje: "Pedido eliminado correctamente"
    });
}

// ============================================================
// CAMBIAR ESTADO DEL PEDIDO - PATCH
// ============================================================

function cambiarEstadoPedido(req, res) {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const pedidos = leerJSON(pedidosArchivo);

    const pedido = pedidos.find(
        pedido => pedido.id === id
    );

    if (!pedido) {
        return res.status(404).json({
            error: "Pedido no encontrado"
        });
    }

    // --------------------------------------------------------
    // VALIDAR ESTADO
    // --------------------------------------------------------

    if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({
            error: "Estado no válido"
        });
    }
       // --------------------------------------------------------
    // REGLAS DE TRANSICIÓN DE ESTADOS
    // --------------------------------------------------------

    if (
        pedido.estado === "Entregado" &&
        estado === "Pendiente"
    ) {
        return res.status(400).json({
            error: "Un pedido entregado no puede volver a Pendiente"
        });
    }

    if (
        pedido.estado === "Cancelado" &&
        estado === "En camino"
    ) {
        return res.status(400).json({
            error: "Un pedido cancelado no puede pasar a En camino"
        });
    }
        // --------------------------------------------------------
    // ACTUALIZAR Y GUARDAR ESTADO
    // --------------------------------------------------------

    pedido.estado = estado;

    guardarJSON(
        pedidosArchivo,
        pedidos
    );

    res.status(200).json(pedido);
} 

// ============================================================
// EXPORTAR FUNCIONES
// ============================================================

module.exports = {
    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    cambiarEstadoPedido
};