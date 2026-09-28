const fs = require("fs/promises");

class Producto {

    constructor(ruta) {
        this.ruta = ruta;
    }

    crearArchivo = async () => {
        try {
            await fs.readFile(this.ruta, { encoding: "utf-8" });
            console.log("Archivo leído exitosamente");
        } catch {
            await fs.writeFile(
                this.ruta,
                JSON.stringify([]),
                { encoding: "utf-8" }
            );

            console.log("Archivo creado exitosamente");
        }
    };

    mostrarProductos = async () => {
        await this.crearArchivo();

        const productos = await fs.readFile(
            this.ruta,
            { encoding: "utf-8" }
        );

        return JSON.parse(productos);
    };

    obtenerProductoPorId = async (id) => {
        const productos = await this.mostrarProductos();

        const producto = productos.find(
            (el) => el.id == parseInt(id)
        );

        return producto || null;
    };

    addProductos = async (producto) => {
        const productos = await this.mostrarProductos();

        productos.push(producto);

        await fs.writeFile(
            this.ruta,
            JSON.stringify(productos, null, 2),
            { encoding: "utf-8" }
        );

        return producto;
    };

    updateProductos = async (id, data) => {
        const productos = await this.mostrarProductos();

        const indice = productos.findIndex(
            (el) => el.id == parseInt(id)
        );

        if (indice === -1) {
            return null;
        }

        const productoActualizado = {
            ...productos[indice],
            ...data,
            id: productos[indice].id
        };

        productos[indice] = productoActualizado;

        await fs.writeFile(
            this.ruta,
            JSON.stringify(productos, null, 2),
            { encoding: "utf-8" }
        );

        return productoActualizado;
    };

    deleteProductos = async (id) => {
        const productos = await this.mostrarProductos();

        const indice = productos.findIndex(
            (el) => el.id == parseInt(id)
        );

        if (indice === -1) {
            return null;
        }

        const productoEliminado = productos.splice(indice, 1);

        await fs.writeFile(
            this.ruta,
            JSON.stringify(productos, null, 2),
            { encoding: "utf-8" }
        );

        return productoEliminado[0];
    };
}

module.exports = Producto;