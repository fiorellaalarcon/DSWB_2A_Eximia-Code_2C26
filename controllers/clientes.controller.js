// ============================================================
// CONTROLADOR DE CLIENTES
// ============================================================
//
// Contiene la lógica HTTP correspondiente al módulo Clientes.
//
// Responsabilidades:
// - Consultar clientes.
// - Crear clientes.
// - Actualizar clientes.
// - Eliminar clientes.
// - Validar datos recibidos.
// - Verificar emails duplicados.
// - Utilizar el modelo Cliente.
// - Utilizar jsonStorage.js para la persistencia.
// ============================================================

const {
    readJson,
    writeJson
} = require("../utils/jsonStorage");

const Cliente = require("../models/Cliente");

const FILE = "clientes.json";

// ============================================================
// GET /api/clientes
// ============================================================

async function listar(req, res, next) {

    try {

        const clientes = await readJson(FILE);

        res.status(200).json(clientes);

    } catch (error) {

        next(error);
    }
}

// ============================================================
// GET /api/clientes/:id
// ============================================================

async function obtenerPorId(req, res, next) {

    try {

        const id = Number(req.params.id);

        // Validamos que el ID tenga formato correcto.
        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                error: "El ID del cliente debe ser un número entero positivo."
            });
        }

        const clientes = await readJson(FILE);

        const cliente = clientes.find(
            cliente => cliente.id === id
        );

        if (!cliente) {

            return res.status(404).json({
                error: "Cliente no encontrado."
            });
        }

        res.status(200).json(cliente);

    } catch (error) {

        next(error);
    }
}

// ============================================================
// POST /api/clientes
// ============================================================

async function crear(req, res, next) {

    try {

        const {
            nombre,
            email,
            direccion,
            telefono
        } = req.body;

        const clientes = await readJson(FILE);

        // ----------------------------------------------------
        // Verificar email duplicado.
        // ----------------------------------------------------

        if (email) {

            const emailNormalizado =
                email.trim().toLowerCase();

            const emailExiste = clientes.some(
                cliente =>
                    cliente.email.toLowerCase() ===
                    emailNormalizado
            );

            if (emailExiste) {

                return res.status(409).json({
                    error:
                        "Ya existe un cliente registrado con ese email."
                });
            }
        }

        // ----------------------------------------------------
        // Generar ID automático.
        // ----------------------------------------------------

        const nuevoId = clientes.length > 0
            ? Math.max(
                ...clientes.map(cliente => cliente.id)
            ) + 1
            : 1;

        // ----------------------------------------------------
        // Crear instancia del modelo Cliente.
        //
        // Cliente hereda de Persona.
        // ----------------------------------------------------

        const nuevoCliente = new Cliente(
            nuevoId,
            nombre,
            email,
            direccion,
            telefono
        );

        clientes.push(nuevoCliente);

        await writeJson(FILE, clientes);

        res.status(201).json(nuevoCliente);

    } catch (error) {

        // Los errores de validación de los modelos
        // corresponden a datos incorrectos enviados por el cliente.

        if (
            error.message.includes("obligatorio")
        ) {

            return res.status(400).json({
                error: error.message
            });
        }

        next(error);
    }
}

// ============================================================
// PUT /api/clientes/:id
// ============================================================

async function actualizar(req, res, next) {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                error:
                    "El ID del cliente debe ser un número entero positivo."
            });
        }

        const {
            nombre,
            email,
            direccion,
            telefono
        } = req.body;

        const clientes = await readJson(FILE);

        const index = clientes.findIndex(
            cliente => cliente.id === id
        );

        if (index === -1) {

            return res.status(404).json({
                error: "Cliente no encontrado."
            });
        }

        // ----------------------------------------------------
        // Verificar email duplicado.
        //
        // Se excluye al propio cliente que estamos modificando.
        // ----------------------------------------------------

        if (email) {

            const emailNormalizado =
                email.trim().toLowerCase();

            const emailExiste = clientes.some(
                cliente =>
                    cliente.id !== id &&
                    cliente.email.toLowerCase() ===
                    emailNormalizado
            );

            if (emailExiste) {

                return res.status(409).json({
                    error:
                        "Ya existe otro cliente registrado con ese email."
                });
            }
        }

        // ----------------------------------------------------
        // Crear nueva instancia del modelo.
        // ----------------------------------------------------

        const clienteActualizado = new Cliente(
            id,
            nombre,
            email,
            direccion,
            telefono
        );

        clientes[index] = clienteActualizado;

        await writeJson(FILE, clientes);

        res.status(200).json(clienteActualizado);

    } catch (error) {

        if (
            error.message.includes("obligatorio")
        ) {

            return res.status(400).json({
                error: error.message
            });
        }

        next(error);
    }
}

// ============================================================
// DELETE /api/clientes/:id
// ============================================================

async function eliminar(req, res, next) {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                error:
                    "El ID del cliente debe ser un número entero positivo."
            });
        }

        const clientes = await readJson(FILE);

        const index = clientes.findIndex(
            cliente => cliente.id === id
        );

        if (index === -1) {

            return res.status(404).json({
                error: "Cliente no encontrado."
            });
        }

        const eliminado =
            clientes.splice(index, 1)[0];

        await writeJson(FILE, clientes);

        res.status(200).json({
            mensaje: "Cliente eliminado correctamente.",
            cliente: eliminado
        });

    } catch (error) {

        next(error);
    }
}

// ============================================================
// EXPORTAR CONTROLADORES
// ============================================================

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};
