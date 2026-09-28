// ============================================================
// MODELO PEDIDO
// ============================================================
// Representa un pedido realizado por un cliente.
//
// Un pedido contiene:
// - Un cliente.
// - Uno o más productos.
// - Un estado de entrega.
// ============================================================

class Pedido {
    constructor(
        id,
        clienteId,
        productos,
        estado
    ) {
        this.id = id;
        this.clienteId = clienteId;
        this.productos = productos;
        this.estado = estado;
    }
}

module.exports = Pedido;