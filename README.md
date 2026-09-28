# FreshRoute — Eximia Code DSWB_2A_Eximia-Code_2C26 

## Desarrollo de Sistemas Web (Back End) — 2° A — 2C2026

Links:
Carpeta con Drive: https://drive.google.com/drive/folders/1DIdFfikiBLpY_M7adQ7gS02nxS6y_cJL?usp=sharing 

Github: https://github.com/fiorellaalarcon/DSWB_2A_Eximia-Code_2C26

Link al Video: https://drive.google.com/file/d/13FJ2l6Ig-kQTDpDHzRFaP_HdFP51kCij/view?usp=sharing


### Integrantes
- Alarcón, Fiorella Melina
- Alva, Axel Roni
- Churquina, Javier
- Jasque Cano, Malena Concepción

## Alcance del primer parcial

Esta versión se mantiene acotada al alcance inicial:

- Node.js + Express.
- Arquitectura MVC.
- Motor de vistas Pug.
- Middleware de Express.
- Rutas dinámicas mediante parámetros.
- Persistencia mediante archivos JSON.
- Programación Orientada a Objetos con Persona -> Cliente.
- CRUD de Clientes, Productos y Pedidos.
- Validaciones en controladores/modelos.
- Reglas básicas de estados de Pedido.
- Consultas mediante query parameters.
- Códigos HTTP y manejo de errores.

**Fuera de alcance en esta entrega:** MongoDB, autenticación/login, roles/perfiles y módulo de Repartidores. Se reservan para etapas posteriores si la consigna lo requiere.

## Requisitos

- Node.js instalado.
- npm.
- Visual Studio Code.
- Thunder Client o Postman.

## Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

## Ejecución

Modo normal:

```bash
npm start
```

Modo desarrollo con Nodemon:

```bash
npm run dev
```

Abrir:

`http://localhost:3000`

## API

### Clientes
- GET `/api/clientes`
- GET `/api/clientes/:id`
- POST `/api/clientes`
- PUT `/api/clientes/:id`
- DELETE `/api/clientes/:id`

### Productos
- GET `/api/productos`
- GET `/api/productos/:id`
- GET `/api/productos?nombre=tomate`
- POST `/api/productos`
- PUT `/api/productos/:id`
- DELETE `/api/productos/:id`

### Pedidos
- GET `/api/pedidos`
- GET `/api/pedidos/:id`
- GET `/api/pedidos?clienteId=1`
- GET `/api/pedidos?estado=Pendiente`
- POST `/api/pedidos`
- PUT `/api/pedidos/:id`
- PATCH `/api/pedidos/:id/estado`
- DELETE `/api/pedidos/:id`

## Prueba rápida con Thunder Client/Postman

### Crear cliente

POST `http://localhost:3000/api/clientes`

```json
{
  "nombre": "Restaurante Norte",
  "email": "norte@freshroute.test",
  "direccion": "Av. Santa Fe 2000",
  "telefono": "1144442222"
}
```

### Crear producto

POST `http://localhost:3000/api/productos`

```json
{
  "nombre": "Papa",
  "descripcion": "Papa fresca",
  "precio": 2200
}
```

### Crear pedido

POST `http://localhost:3000/api/pedidos`

```json
{
  "clienteId": 1,
  "productos": [
    {
      "productoId": 1,
      "cantidad": 2
    }
  ],
  "estado": "Pendiente"
}
```

### Cambiar estado

PATCH `http://localhost:3000/api/pedidos/1/estado`

```json
{
  "estado": "Preparado"
}
```

### Probar consultas

GET `http://localhost:3000/api/productos?nombre=tomate`

GET `http://localhost:3000/api/pedidos?clienteId=1`

GET `http://localhost:3000/api/pedidos?estado=Pendiente`

### Probar una regla de negocio

Primero llevar un pedido a `Entregado`. Luego intentar:

PATCH `http://localhost:3000/api/pedidos/1/estado`

```json
{
  "estado": "Pendiente"
}
```

Debe responder HTTP 409 con un mensaje de regla de negocio.

## Estructura

```text
app.js
controllers/
data/
middlewares/
models/
public/
routes/
utils/
views/
```
