// ============================================================
// PERSONA - SUPERCLASE
// ============================================================
//
// Persona representa los datos comunes de una persona.
//
// Se utiliza como superclase para aplicar el concepto de
// herencia de Programación Orientada a Objetos.
// ============================================================

class Persona {

    constructor(id, nombre, apellido, email) {

        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
    }

    // Método heredable por las clases hijas.
    obtenerNombreCompleto() {

        return `${this.nombre} ${this.apellido}`;

    }
}

module.exports = Persona;
