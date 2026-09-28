// ============================================================
// MODELO PEDIDO
// ============================================================

const ESTADOS_PEDIDO = {
    PENDIENTE: "Pendiente",
    PREPARADO: "Preparado",
    EN_CAMINO: "En camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado"
};

class Pedido {

    constructor(
        id,
        clienteId,
        productos,
        estado = ESTADOS_PEDIDO.PENDIENTE,
        fecha = new Date().toISOString()
    ) {

        if (!clienteId) {
            throw new Error(
                "El pedido debe estar asociado a un cliente"
            );
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error(
                "El pedido debe contener al menos un producto"
            );
        }

        this.id = id;
        this.clienteId = Number(clienteId);
        this.productos = productos;
        this.estado = estado;
        this.fecha = fecha;
    }

    cambiarEstado(nuevoEstado) {

        const estadosPermitidos = Object.values(ESTADOS_PEDIDO);

        if (!estadosPermitidos.includes(nuevoEstado)) {
            throw new Error("Estado no válido");
        }

        if (
            this.estado === ESTADOS_PEDIDO.ENTREGADO &&
            nuevoEstado === ESTADOS_PEDIDO.PENDIENTE
        ) {
            throw new Error(
                "Un pedido entregado no puede volver a Pendiente"
            );
        }

        if (
            this.estado === ESTADOS_PEDIDO.CANCELADO &&
            nuevoEstado === ESTADOS_PEDIDO.EN_CAMINO
        ) {
            throw new Error(
                "Un pedido cancelado no puede pasar a En camino"
            );
        }

        this.estado = nuevoEstado;
        return this;
    }
}

module.exports = Pedido;
module.exports.ESTADOS_PEDIDO = ESTADOS_PEDIDO;