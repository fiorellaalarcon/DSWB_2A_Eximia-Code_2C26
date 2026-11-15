import { describe, test, expect } from "@jest/globals";
import { TRANSICIONES, siguientesPermitidos } from "../../models/Pedido.js";

describe("Pedido - transiciones de estado por rol", () => {
  test("Entregado y Cancelado son estados finales (sin salida)", () => {
    expect(Object.keys(TRANSICIONES.Entregado)).toHaveLength(0);
    expect(Object.keys(TRANSICIONES.Cancelado)).toHaveLength(0);
  });
  test("cada rol ve solo los pasos que le corresponden", () => {
    expect(siguientesPermitidos("Pendiente", "deposito")).toEqual(["Preparado"]);
    expect(siguientesPermitidos("Pendiente", "administrativo")).toEqual(["Cancelado"]);
    expect(siguientesPermitidos("Preparado", "planificador")).toEqual(["En camino", "Cancelado"]);
    expect(siguientesPermitidos("En camino", "repartidor")).toEqual(["Entregado"]);
    expect(siguientesPermitidos("En camino", "planificador")).toEqual(["Cancelado"]); // ya no confirma entregas
    expect(siguientesPermitidos("Pendiente", "directivo")).toEqual([]);
  });
  test("un pedido Entregado nunca vuelve a Pendiente", () => {
    expect(Object.hasOwn(TRANSICIONES.Entregado, "Pendiente")).toBe(false);
  });
});
