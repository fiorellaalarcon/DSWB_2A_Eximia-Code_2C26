// ============================================================
// PERSONA - SUPERCLASE
// ============================================================
//
// Persona representa los datos comunes de una persona.
//
// Se utiliza como superclase para aplicar el concepto de
// herencia de Programación Orientada a Objetos.
//
// Las clases específicas, como Cliente, pueden heredar
// sus atributos y métodos.
// ============================================================

class Persona {

    constructor(id, nombre, email) {

        // Validación de los atributos comunes.
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            throw new Error("El nombre es obligatorio.");
        }

        if (!email || typeof email !== "string" || !email.trim()) {
            throw new Error("El email es obligatorio.");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.email = email.trim();
    }

    // ========================================================
    // MÉTODO HEREDABLE
    // ========================================================
    //
    // Puede ser utilizado por las clases que hereden de Persona.
    // ========================================================

    obtenerInformacionBasica() {
        return `${this.nombre} (${this.email})`;
    }
}

module.exports = Persona;
