const { Router } = require("express");

const clase = require("../models/ProductManager.js")

const manager = new clase("./data/productos.json")

const router = Router();

router.get("/", async(req, res) => {
    try{
        res.status(200).json(await manager.mostrarProductos())
    }catch(error){
        res.status(400).send("Ha ocurrido un error al mostrar los productos")
        console.log(error)
    }
})

router.get("/:id", async(req, res) => {
    const pk = req.params.id 
    const productos = await manager.mostrarProductos();
    const encontrado = productos.find((el) => el.id == parseInt(pk))
    try{
        res.status(200).json(encontrado)
    }catch(error){
        res.status(400).send("Ha ocurrido un error al buscar el producto")
        console.log(error)
    }
})

router.post("/", async(req, res) => {
    const cuerpo = req.body
    try{
        res.status(200).json(await manager.addProductos(cuerpo));
    }catch(error){
        res.status(400).send("Ha ocurrio un error al cargar un producto")
        console.log(error)
    }

})

router.put("/:id", async(req, res) => {
    const pk = req.params.id
    const cuerpo = req.body
    try{
        res.status(200).json(await manager.updateProductos(pk, cuerpo))
    }catch(error){
        res.status(400).send("Ha ocurrido un error al actualizar un producto")
        console.log(error)
    }
})

router.delete("/:id", async(req, res) => {
    const pk = req.params.id
    try{
        res.status(200).json(await manager.deleteProductos(pk))
    }catch(error){
        res.status(400).send("Ha ocurrido un error al borrar un producto")
        console.log(error)
    }
})




module.exports = router;
