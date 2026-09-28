const fs = require("fs");

function leerJSON(archivo) {
    const datos = fs.readFileSync(archivo, "utf-8");
    return JSON.parse(datos);
}

function guardarJSON(archivo, datos) {
    fs.writeFileSync(
        archivo,
        JSON.stringify(datos, null, 4)
    );
}

module.exports = {
    leerJSON,
    guardarJSON
};