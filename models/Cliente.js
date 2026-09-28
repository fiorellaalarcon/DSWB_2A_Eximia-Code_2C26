// ============================================================
// CLIENTE - SUBCLASE DE PERSONA
// ============================================================
//
// Cliente hereda de Persona.
//
// Esto permite demostrar:
// - Superclase: Persona.
// - Subclase: Cliente.
// - Herencia.
// - Reutilización de atributos mediante super().
// ============================================================

const Persona = require("./Persona");

class Cliente extends Persona {

    constructor(id, nombre, email, direccion, telefono) {

        // ----------------------------------------------------
        // Llamamos al constructor de Persona.
        //
        // Persona se encarga de validar y asignar:
        // - id
        // - nombre
        // - email
        // ----------------------------------------------------

        super(id, nombre, email);

        // ----------------------------------------------------
        // Validaciones propias de Cliente.
        // ----------------------------------------------------

        if (
            !direccion ||
            typeof direccion !== "string" ||
            !direccion.trim()
        ) {
            throw new Error(
                "La dirección es obligatoria."
            );
        }

        if (
            !telefono ||
            typeof telefono !== "string" ||
            !telefono.trim()
        ) {
            throw new Error(
                "El teléfono es obligatorio."
            );
        }

        // ----------------------------------------------------
        // Atributos específicos de Cliente.
        // ----------------------------------------------------

        this.direccion = direccion.trim();
        this.telefono = telefono.trim();
    }
}

module.exports = Cliente;
