// ============================================================
// MODELO PRODUCTO
// ============================================================
//
// Representa un producto que puede formar parte de un pedido.
//
// En esta primera entrega el modelo se concentra en los datos
// propios del producto y sus validaciones básicas.
//
// La persistencia se realiza mediante utils/jsonStorage.js.
// ============================================================

class Producto {
    constructor(id, nombre, precio) {

        // El nombre es obligatorio.
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            throw new Error("El nombre del producto es obligatorio.");
        }

        // El precio debe ser numérico y mayor a cero.
        if (
            typeof precio !== "number" ||
            Number.isNaN(precio) ||
            precio <= 0
        ) {
            throw new Error("El precio debe ser un número mayor a cero.");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.precio = precio;
    }
}

module.exports = Producto;