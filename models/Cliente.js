// ============================================================
// CLIENTE - SUBCLASE DE PERSONA
// ============================================================
//
// Cliente hereda de Persona.
//
// Esto permite demostrar:
// - Clase padre/superclase.
// - Clase hija/subclase.
// - Herencia.
// - Reutilización de atributos y métodos.
// ============================================================

const Persona = require("./Persona");

class Cliente extends Persona {

    constructor(id, nombre, apellido, email, empresa) {

        // super() llama al constructor de Persona.
        // De esta manera Cliente hereda sus atributos.
        super(id, nombre, apellido, email);

        // Atributo específico de Cliente.
        this.empresa = empresa;
    }
}

module.exports = Cliente;
