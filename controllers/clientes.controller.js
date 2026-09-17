// ============================================================
// CONTROLLER DE CLIENTES
// ============================================================
//
// Este archivo contiene la lógica correspondiente al módulo
// Clientes.
//
// El controller se encarga de recibir la solicitud desde las
// rutas, procesar los datos y devolver una respuesta HTTP.
//
// La persistencia se realiza en clientes.json.
// ============================================================

const fs = require("fs");
const path = require("path");

const Cliente = require("../models/Cliente");

// Ruta absoluta al archivo JSON.
const archivo = path.join(
    __dirname,
    "../data/clientes.json"
);

// ------------------------------------------------------------
// FUNCIÓN AUXILIAR PARA LEER CLIENTES
// ------------------------------------------------------------

function leerClientes() {

    const datos = fs.readFileSync(archivo, "utf-8");

    return JSON.parse(datos);
}

// ------------------------------------------------------------
// FUNCIÓN AUXILIAR PARA GUARDAR CLIENTES
// ------------------------------------------------------------

function guardarClientes(clientes) {

    fs.writeFileSync(
        archivo,
        JSON.stringify(clientes, null, 4)
    );
}

// ------------------------------------------------------------
// GET /api/clientes
// Obtener todos los clientes.
// ------------------------------------------------------------

function obtenerClientes(req, res) {

    const clientes = leerClientes();

    res.status(200).json(clientes);
}

// ------------------------------------------------------------
// GET /api/clientes/:id
// Obtener un cliente específico.
// ------------------------------------------------------------

function obtenerClientePorId(req, res) {

    // req.params permite obtener el parámetro dinámico :id.
    const id = Number(req.params.id);

    const clientes = leerClientes();

    const cliente = clientes.find(
        cliente => cliente.id === id
    );

    // Si no existe, respondemos 404.
    if (!cliente) {

        return res.status(404).json({
            error: "Cliente no encontrado"
        });
    }

    res.status(200).json(cliente);
}

// ------------------------------------------------------------
// POST /api/clientes
// Crear un nuevo cliente.
// ------------------------------------------------------------

function crearCliente(req, res) {

    const {
        nombre,
        apellido,
        email,
        empresa
    } = req.body;

    // Validación de campos obligatorios.
    if (!nombre || !email || !empresa) {

        return res.status(400).json({
            error: "Nombre, email y empresa son obligatorios"
        });
    }

    const clientes = leerClientes();

    // Generamos un nuevo ID.
    const nuevoId = clientes.length > 0
        ? Math.max(...clientes.map(c => c.id)) + 1
        : 1;

    const nuevoCliente = new Cliente(
        nuevoId,
        nombre,
        apellido || "",
        email,
        empresa
    );

    clientes.push(nuevoCliente);

    guardarClientes(clientes);

    res.status(201).json(nuevoCliente);
}

// ------------------------------------------------------------
// PUT /api/clientes/:id
// Actualizar un cliente existente.
// ------------------------------------------------------------

function actualizarCliente(req, res) {

    const id = Number(req.params.id);

    const clientes = leerClientes();

    const indice = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (indice === -1) {

        return res.status(404).json({
            error: "Cliente no encontrado"
        });
    }

    const {
        nombre,
        apellido,
        email,
        empresa
    } = req.body;

    if (!nombre || !email || !empresa) {

        return res.status(400).json({
            error: "Nombre, email y empresa son obligatorios"
        });
    }

    clientes[indice] = {
        id,
        nombre,
        apellido: apellido || "",
        email,
        empresa
    };

    guardarClientes(clientes);

    res.status(200).json(clientes[indice]);
}

// ------------------------------------------------------------
// DELETE /api/clientes/:id
// Eliminar un cliente.
// ------------------------------------------------------------

function eliminarCliente(req, res) {

    const id = Number(req.params.id);

    const clientes = leerClientes();

    const indice = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (indice === -1) {

        return res.status(404).json({
            error: "Cliente no encontrado"
        });
    }

    const eliminado = clientes.splice(indice, 1)[0];

    guardarClientes(clientes);

    res.status(200).json({
        mensaje: "Cliente eliminado correctamente",
        cliente: eliminado
    });
}

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};
