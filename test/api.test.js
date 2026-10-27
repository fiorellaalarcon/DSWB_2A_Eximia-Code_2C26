// ============================================================
// PRUEBAS AUTOMATICAS (node:test, incluido en Node: sin instalar nada)
// ============================================================
// Se prueban las AREAS CRITICAS del sistema, una o dos por modulo:
//   Auth | Permisos por rol | Validacion (middleware) | Baja logica
//   Pedidos: reglas de negocio, transiciones y quien puede hacer cada paso
// Usan una base SEPARADA (MONGO_URI_TEST) para no tocar datos reales.
// Ejecutar:  npm test     (requiere MongoDB encendido)
// ============================================================
process.env.NODE_ENV = "test"; // silencia el logger
import "dotenv/config";
import { before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import app from "../app.js";
import { Usuario } from "../models/Usuario.js";
import { Repartidor } from "../models/Repartidor.js";
import { Cliente } from "../models/Cliente.js";

let servidor, base;
const ids = {}; // ids de usuarios de prueba (uno por rol)
const repIds = {}; // ids de los repartidores vinculados a las cuentas "repartidor" y "repartidor2"

// Helper: hace fetch a la app de test con el usuario indicado.
const api = async (metodo, ruta, { usuario, body } = {}) => {
  const res = await fetch(base + ruta, {
    method: metodo,
    headers: { "Content-Type": "application/json", ...(usuario && { "x-usuario-id": ids[usuario] }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};
const estado = (id, usuario, nuevo, extra = {}) =>
  api("PATCH", `/api/pedidos/${id}/estado`, { usuario, body: { estado: nuevo, ...extra } });

before(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/freshroute_test");
  await mongoose.connection.dropDatabase(); // base de test limpia
  // Dos choferes, cada uno con su cuenta vinculada.
  const [r1, r2] = await Repartidor.create([
    { nombre: "Chofer Uno", telefono: "1" },
    { nombre: "Chofer Dos", telefono: "2" },
  ]);
  repIds.uno = String(r1._id);
  repIds.dos = String(r2._id);
  const us = await Usuario.create([
    ...["administrador", "administrativo", "deposito", "planificador", "directivo"].map((rol) => ({
      nombre: rol, usuario: rol, password: "Clave.1234", rol,
    })),
    { nombre: "Chofer Uno", usuario: "repartidor", password: "Clave.1234", rol: "repartidor", repartidor: r1._id },
    { nombre: "Chofer Dos", usuario: "repartidor2", password: "Clave.1234", rol: "repartidor", repartidor: r2._id },
  ]);
  us.forEach((u) => (ids[u.usuario] = String(u._id)));
  servidor = app.listen(0); // puerto libre al azar
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  servidor.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Auth", () => {
  it("T1 login correcto devuelve usuario y rol (sin password)", async () => {
    const r = await api("POST", "/api/auth/login", { body: { usuario: "deposito", password: "Clave.1234" } });
    assert.equal(r.status, 200);
    assert.equal(r.data.usuario.rol, "deposito");
    assert.equal(r.data.usuario.password, undefined);
  });
  it("T2 login con clave incorrecta -> 401", async () => {
    const r = await api("POST", "/api/auth/login", { body: { usuario: "deposito", password: "mal" } });
    assert.equal(r.status, 401);
  });
  it("T3 API sin identificar -> 401", async () => {
    assert.equal((await api("GET", "/api/clientes")).status, 401);
  });
});

describe("Permisos por rol y validaciones", () => {
  const cliente = { nombre: "X", email: "x@x.com", direccion: "d", telefono: "1" };
  it("T4 directivo (solo lectura) no puede crear cliente -> 403", async () => {
    assert.equal((await api("POST", "/api/clientes", { usuario: "directivo", body: cliente })).status, 403);
  });
  it("T5 operador de deposito no administra clientes -> 403", async () => {
    assert.equal((await api("POST", "/api/clientes", { usuario: "deposito", body: cliente })).status, 403);
  });
  it("T6 planificador gestiona repartidores pero no productos", async () => {
    const rep = await api("POST", "/api/repartidores", { usuario: "planificador", body: { nombre: "R", telefono: "1" } });
    assert.equal(rep.status, 201);
    assert.equal((await api("POST", "/api/productos", { usuario: "planificador", body: { nombre: "P", precio: 5 } })).status, 403);
  });
  it("T7 body invalido -> 400 con lista de errores (middleware)", async () => {
    const r = await api("POST", "/api/clientes", { usuario: "administrativo", body: { nombre: "", email: "no-es-mail" } });
    assert.equal(r.status, 400);
    assert.ok(r.data.errores.length >= 3);
  });
  it("T8 roles operativos no ven inactivos -> 403", async () => {
    assert.equal((await api("GET", "/api/clientes?incluirInactivos=true", { usuario: "administrativo" })).status, 403);
  });
  it("T9 solo el administrador gestiona usuarios -> 403 a los demas", async () => {
    assert.equal((await api("GET", "/api/usuarios", { usuario: "directivo" })).status, 403);
    assert.equal((await api("GET", "/api/usuarios", { usuario: "administrador" })).status, 200);
  });
  it("T9b usuario repartidor: exige vinculo (400) y un repartidor no puede tener dos cuentas (409)", async () => {
    const base = { nombre: "N", usuario: "nuevo1", password: "Clave.1234", rol: "repartidor" };
    assert.equal((await api("POST", "/api/usuarios", { usuario: "administrador", body: base })).status, 400);
    const repetido = { ...base, usuario: "nuevo2", repartidor: repIds.uno }; // ya lo usa la cuenta "repartidor"
    assert.equal((await api("POST", "/api/usuarios", { usuario: "administrador", body: repetido })).status, 409);
  });
  it("T9d politica de contrasena en el backend: debil -> 400; valida -> 201", async () => {
    const base = { nombre: "N", usuario: "nuevo3", rol: "directivo" };
    for (const debil of ["Corta.1", "sinmayuscula.1", "SINMINUSCULA.1", "SinCaracter1234", "abc"]) {
      const r = await api("POST", "/api/usuarios", { usuario: "administrador", body: { ...base, password: debil } });
      assert.equal(r.status, 400, `debia rechazar "${debil}"`);
      assert.equal(r.data.errores[0].campo, "password");
    }
    assert.equal((await api("POST", "/api/usuarios", { usuario: "administrador", body: { ...base, password: "Valida.123" } })).status, 201);
  });
  it("T9e capa BASE DE DATOS: el esquema rechaza clave debil y email sin arroba aunque se salte la API", async () => {
    await assert.rejects(Usuario.create({ nombre: "X", usuario: "bd1", password: "debil", rol: "directivo" }), { name: "ValidationError" });
    await assert.rejects(Cliente.create({ nombre: "X", email: "sin-arroba", direccion: "d", telefono: "1" }), { name: "ValidationError" });
  });
  it("T9c el repartidor no puede consultar clientes, productos ni repartidores -> 403", async () => {
    for (const ruta of ["/api/clientes", "/api/productos", "/api/repartidores"])
      assert.equal((await api("GET", ruta, { usuario: "repartidor" })).status, 403);
  });
});

describe("Baja logica e historial", () => {
  it("T10 la baja NO borra: deja de listarse pero el directivo la ve inactiva", async () => {
    const c = (await api("POST", "/api/clientes", { usuario: "administrativo", body: { nombre: "Baja SA", email: "baja@x.com", direccion: "Calle 1", telefono: "111" } })).data;
    assert.equal((await api("DELETE", `/api/clientes/${c._id}`, { usuario: "administrativo" })).status, 200);
    const activos = (await api("GET", "/api/clientes", { usuario: "administrativo" })).data;
    assert.ok(!activos.some((x) => x._id === c._id));
    const hist = (await api("GET", "/api/clientes?soloInactivos=true", { usuario: "directivo" })).data;
    assert.ok(hist.some((x) => x._id === c._id && x.activo === false));
    // solo el administrador reactiva
    assert.equal((await api("PATCH", `/api/clientes/${c._id}/reactivar`, { usuario: "administrativo" })).status, 403);
    assert.equal((await api("PATCH", `/api/clientes/${c._id}/reactivar`, { usuario: "administrador" })).status, 200);
  });
  it("T11 email duplicado -> 409", async () => {
    const body = { nombre: "Dup", email: "dup@x.com", direccion: "d", telefono: "1" };
    await api("POST", "/api/clientes", { usuario: "administrativo", body });
    assert.equal((await api("POST", "/api/clientes", { usuario: "administrativo", body })).status, 409);
  });
});

describe("Pedidos: reglas de negocio y estados", () => {
  let cliente, producto, repartidor, pedido;
  before(async () => {
    cliente = (await api("POST", "/api/clientes", { usuario: "administrativo", body: { nombre: "Cli Pedido", email: "ped@x.com", direccion: "d", telefono: "1" } })).data;
    producto = (await api("POST", "/api/productos", { usuario: "administrativo", body: { nombre: "Tomate", precio: 100 } })).data;
    repartidor = { _id: repIds.uno }; // el chofer vinculado a la cuenta "repartidor"
  });
  const nuevoPedido = async () =>
    (await api("POST", "/api/pedidos", { usuario: "administrativo", body: { cliente: cliente._id, items: [{ producto: producto._id, cantidad: 3 }] } })).data;

  it("T12 pedido sin productos -> 400", async () => {
    const r = await api("POST", "/api/pedidos", { usuario: "administrativo", body: { cliente: cliente._id, items: [] } });
    assert.equal(r.status, 400);
  });
  it("T13 pedido con cliente inexistente -> 404", async () => {
    const r = await api("POST", "/api/pedidos", { usuario: "administrativo", body: { cliente: new mongoose.Types.ObjectId(), items: [{ producto: producto._id, cantidad: 1 }] } });
    assert.equal(r.status, 404);
  });
  it("T14 el deposito no puede crear pedidos -> 403", async () => {
    const r = await api("POST", "/api/pedidos", { usuario: "deposito", body: { cliente: cliente._id, items: [{ producto: producto._id, cantidad: 1 }] } });
    assert.equal(r.status, 403);
  });
  it("T15 pedido valido nace Pendiente, calcula total y cada rol ve sus pasos", async () => {
    pedido = await nuevoPedido();
    assert.equal(pedido.estado, "Pendiente");
    assert.equal(pedido.total, 300);
    const paraDeposito = (await api("GET", `/api/pedidos/${pedido._id}`, { usuario: "deposito" })).data;
    const paraPlanif = (await api("GET", `/api/pedidos/${pedido._id}`, { usuario: "planificador" })).data;
    assert.deepEqual(paraDeposito.siguientesEstados, ["Preparado"]);
    assert.deepEqual(paraPlanif.siguientesEstados, []);
  });
  it("T16 transicion invalida Pendiente -> Entregado -> 409", async () => {
    assert.equal((await estado(pedido._id, "planificador", "Entregado")).status, 409);
  });
  it("T17 rol equivocado: el planificador no prepara (403) y el deposito no despacha (403)", async () => {
    assert.equal((await estado(pedido._id, "planificador", "Preparado")).status, 403);
    assert.equal((await estado(pedido._id, "deposito", "Preparado")).status, 200); // el deposito si
    assert.equal((await estado(pedido._id, "deposito", "En camino", { repartidor: repartidor._id })).status, 403);
  });
  it("T18 despachar sin repartidor -> 400", async () => {
    assert.equal((await estado(pedido._id, "planificador", "En camino")).status, 400);
  });
  it("T19 flujo completo: En camino ocupa al repartidor; Entregado lo libera", async () => {
    assert.equal((await estado(pedido._id, "planificador", "En camino", { repartidor: repartidor._id })).status, 200);
    assert.equal((await api("GET", `/api/repartidores/${repartidor._id}`, { usuario: "directivo" })).data.disponible, false);
    // El planificador (oficina) NO confirma entregas; las confirma el repartidor asignado.
    assert.equal((await estado(pedido._id, "planificador", "Entregado")).status, 403);
    assert.equal((await estado(pedido._id, "repartidor", "Entregado")).status, 200);
    assert.equal((await api("GET", `/api/repartidores/${repartidor._id}`, { usuario: "directivo" })).data.disponible, true);
  });
  it("T20 Entregado no puede volver a Pendiente -> 409", async () => {
    assert.equal((await estado(pedido._id, "administrativo", "Pendiente")).status, 409);
  });
  let enCamino; // pedido en ruta con el chofer uno (lo usan T21 a T21e)
  it("T21 repartidor ocupado no puede recibir otro pedido -> 409", async () => {
    const a = await nuevoPedido(), b = await nuevoPedido();
    for (const p of [a, b]) await estado(p._id, "deposito", "Preparado");
    assert.equal((await estado(a._id, "planificador", "En camino", { repartidor: repartidor._id })).status, 200);
    assert.equal((await estado(b._id, "planificador", "En camino", { repartidor: repartidor._id })).status, 409);
    enCamino = a;
  });
  it("T21b el repartidor solo ve SUS pedidos", async () => {
    const mios = (await api("GET", "/api/pedidos", { usuario: "repartidor" })).data;
    assert.ok(mios.length >= 1);
    assert.ok(mios.every((p) => p.repartidor._id === repIds.uno));
    assert.deepEqual((await api("GET", "/api/pedidos", { usuario: "repartidor2" })).data, []);
    assert.deepEqual(mios.find((p) => p._id === enCamino._id).siguientesEstados, ["Entregado"]);
  });
  it("T21c un repartidor no ve ni cierra el pedido de otro -> 403", async () => {
    assert.equal((await api("GET", `/api/pedidos/${enCamino._id}`, { usuario: "repartidor2" })).status, 403);
    assert.equal((await estado(enCamino._id, "repartidor2", "Entregado")).status, 403);
  });
  it("T21d el repartidor no crea pedidos ni prepara ni despacha -> 403", async () => {
    const body = { cliente: cliente._id, items: [{ producto: producto._id, cantidad: 1 }] };
    assert.equal((await api("POST", "/api/pedidos", { usuario: "repartidor", body })).status, 403);
    const p = await nuevoPedido();
    assert.equal((await estado(p._id, "repartidor", "Preparado")).status, 403);
  });
  it("T21e el repartidor confirma SU entrega y queda libre", async () => {
    assert.equal((await estado(enCamino._id, "repartidor", "Entregado")).status, 200);
    assert.equal((await api("GET", `/api/repartidores/${repIds.uno}`, { usuario: "directivo" })).data.disponible, true);
  });
  it("T22 pedido Cancelado no puede ser enviado -> 409", async () => {
    const p = await nuevoPedido();
    assert.equal((await estado(p._id, "administrativo", "Cancelado")).status, 200);
    assert.equal((await estado(p._id, "planificador", "En camino", { repartidor: repartidor._id })).status, 409);
  });
  it("T23 consulta por cliente y por estado", async () => {
    const r = await api("GET", `/api/pedidos?cliente=${cliente._id}&estado=Entregado`, { usuario: "directivo" });
    assert.equal(r.status, 200);
    assert.equal(r.data.length, 2); // el de T19 y el que entrego el repartidor en T21e
    assert.ok(r.data.every((p) => p.estado === "Entregado" && p.cliente._id === cliente._id));
  });
  it("T24 las acciones quedan en auditoria (visible para directivo, no para deposito)", async () => {
    const r = await api("GET", "/api/auditoria?accion=CAMBIO_ESTADO", { usuario: "directivo" });
    assert.equal(r.status, 200);
    assert.ok(r.data.length >= 5);
    assert.equal((await api("GET", "/api/auditoria", { usuario: "deposito" })).status, 403);
  });
});
