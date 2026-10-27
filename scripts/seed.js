// ============================================================
// SEED - DATOS INICIALES DE PRUEBA
// ============================================================
// Uso:  npm run seed
// BORRA las colecciones y las vuelve a crear con datos de ejemplo
// (incluye los 3 usuarios, uno por rol). Reemplaza a los archivos
// data/*.json de la 1ra entrega.
// Cumplen la politica (8+ caracteres, mayuscula, minuscula y caracter especial).
// Las contrasenas estan en texto plano A PROPOSITO (limitacion
// documentada de esta entrega: todavia no hay hash).
// ============================================================
import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "../config/db.js";
import { Usuario } from "../models/Usuario.js";
import { Cliente } from "../models/Cliente.js";
import { Producto } from "../models/Producto.js";
import { Repartidor } from "../models/Repartidor.js";
import { Pedido } from "../models/Pedido.js";
import { Auditoria } from "../models/Auditoria.js";

await conectarDB();

await Promise.all([Usuario, Cliente, Producto, Repartidor, Pedido, Auditoria].map((m) => m.deleteMany({})));

const [admin] = await Usuario.create([
  { nombre: "Admin FreshRoute", usuario: "admin", password: "Admin.123", rol: "administrador" },
  { nombre: "Ana Administrativa", usuario: "administrativo", password: "Oficina.123", rol: "administrativo" },
  { nombre: "Omar Operador de Deposito", usuario: "deposito", password: "Deposito.123", rol: "deposito" },
  { nombre: "Paula Planificadora", usuario: "planificador", password: "Planif.123", rol: "planificador" },
  { nombre: "Diego Directivo", usuario: "directivo", password: "Direct.123", rol: "directivo" },
]);

const clientes = await Cliente.create([
  { nombre: "Restaurante Central", email: "central@freshroute.test", direccion: "Av. Corrientes 1350", telefono: "1155552222", creadoPor: admin._id },
  { nombre: "Restaurante Norte", email: "norte@freshroute.test", direccion: "Av. Santa Fe 2000", telefono: "1144442222", creadoPor: admin._id },
  { nombre: "Restaurante Mary", email: "mary@freshroute.test", direccion: "Av. Mitre 557", telefono: "1144442223", creadoPor: admin._id },
]);

const productos = await Producto.create([
  { nombre: "Tomate fresco", descripcion: "Tomate para cocina (kg)", precio: 2500, creadoPor: admin._id },
  { nombre: "Lechuga", descripcion: "Lechuga fresca (unidad)", precio: 1200, creadoPor: admin._id },
  { nombre: "Pollo refrigerado", descripcion: "Pollo entero (kg)", precio: 5200, creadoPor: admin._id },
]);

const [carlos, lucia] = await Repartidor.create([
  { nombre: "Carlos Perez", telefono: "1166660001", patente: "AB123CD", disponible: false, creadoPor: admin._id }, // tiene una entrega en curso (ver pedido 2)
  { nombre: "Lucia Gomez", telefono: "1166660002", patente: "AC456DE", creadoPor: admin._id },
]);

// Cada chofer tiene su propia cuenta, vinculada a su registro de repartidor.
await Usuario.create([
  { nombre: "Carlos Perez", usuario: "repartidor1", password: "Repa.1234", rol: "repartidor", repartidor: carlos._id },
  { nombre: "Lucia Gomez", usuario: "repartidor2", password: "Repa.5678", rol: "repartidor", repartidor: lucia._id },
]);

await Pedido.create({
  cliente: clientes[0]._id,
  items: [{ producto: productos[0]._id, cantidad: 3, precioUnitario: productos[0].precio }],
  total: 3 * productos[0].precio,
  estado: "Pendiente",
  historialEstados: [{ estado: "Pendiente", usuario: admin._id }],
  creadoPor: admin._id,
});

// Pedido 2: ya despachado con Carlos, para que "repartidor1" tenga algo que entregar.
await Pedido.create({
  cliente: clientes[1]._id,
  items: [{ producto: productos[1]._id, cantidad: 5, precioUnitario: productos[1].precio }],
  total: 5 * productos[1].precio,
  estado: "En camino",
  repartidor: carlos._id,
  historialEstados: ["Pendiente", "Preparado", "En camino"].map((estado) => ({ estado, usuario: admin._id })),
  creadoPor: admin._id,
});

console.log("Datos de ejemplo creados.");
console.log("Usuarios: admin/Admin.123 | administrativo/Oficina.123 | deposito/Deposito.123 | planificador/Planif.123 | directivo/Direct.123 | repartidor1/Repa.1234 | repartidor2/Repa.5678");
await mongoose.disconnect();
