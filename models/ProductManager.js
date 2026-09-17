const fs = require("fs/promises");

class ProductManager{
    constructor(ruta){
        this.ruta = ruta;
    }

    crearArchivo = async() => {
        try{
            await fs.readFile(this.ruta, {encoding: "utf-8"})
            console.log("Archivo leido exitosamente")
        }catch{
            await fs.writeFile(this.ruta, JSON.stringify([]), {encoding: "utf-8"})
            console.log("Archivo creado exitosamente")
        }
    }

    mostrarProductos = async() => {
        await this.crearArchivo();
        const productos = await fs.readFile(this.ruta, {encoding: "utf-8"});
        return JSON.parse(productos);
    }

    addProductos = async(producto) => {
        const productos = await this.mostrarProductos()
        productos.push(producto);
        await fs.writeFile(this.ruta, JSON.stringify(productos), {encoding: "utf-8"})
    }

    updateProductos = async(id, data) => {
        const productos = await this.mostrarProductos()
        const indice = productos.findIndex((el) => el.id == parseInt(id))
        let productoActualizado = {
            ...data,
            ...productos[indice],
            id: productos[indice].id
        }
        productos[indice] = productoActualizado
        await fs.writeFile(this.ruta, JSON.stringify(productos), {encoding: "utf-8"})
    }

    deleteProductos = async(id) => {
        const productos = await this.mostrarProductos();
        const indice = productos.findIndex((el) => el.id == parseInt(id))
        productos.splice(indice, 1);
        await fs.writeFile(this.ruta, JSON.stringify(productos), {encoding: "utf-8"})
    }

}

module.exports = ProductManager;