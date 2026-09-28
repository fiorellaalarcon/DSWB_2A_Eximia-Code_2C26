# Guía de pruebas para la evidencia

Usar Thunder Client o Postman con el servidor ejecutándose mediante `npm run dev`.

## 1. GET clientes
GET `http://localhost:3000/api/clientes`
Esperado: HTTP 200.

## 2. POST cliente
POST `http://localhost:3000/api/clientes`
Esperado: HTTP 201.

Body:
```json
{
  "nombre": "Restaurante Norte",
  "email": "norte@freshroute.test",
  "direccion": "Av. Santa Fe 2000",
  "telefono": "1144442222"
}
```

## 3. GET producto con query
GET `http://localhost:3000/api/productos?nombre=tomate`
Esperado: HTTP 200 y productos coincidentes.

## 4. GET pedidos por cliente
GET `http://localhost:3000/api/pedidos?clienteId=1`
Esperado: HTTP 200.

## 5. GET pedidos por estado
GET `http://localhost:3000/api/pedidos?estado=Pendiente`
Esperado: HTTP 200.

## 6. POST pedido
POST `http://localhost:3000/api/pedidos`
Esperado: HTTP 201.

Body:
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

## 7. PATCH estado
PATCH `http://localhost:3000/api/pedidos/1/estado`

```json
{
  "estado": "Preparado"
}
```

Esperado: HTTP 200.