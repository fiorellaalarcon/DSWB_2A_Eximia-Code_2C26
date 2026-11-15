import { describe, test, expect } from "@jest/globals";
process.env.JWT_SECRET = "clave-de-pruebas-de-al-menos-32-caracteres-123456";
const { crearPasswordSeguro, verificarPassword, firmarToken, verificarToken } = await import("../../services/auth.service.js");

describe("auth.service - hash PBKDF2 con sal", () => {
  test("el hash no es la clave y la verificacion funciona", async () => {
    const { salt, passwordHash } = await crearPasswordSeguro("Valida.123");
    expect(passwordHash).not.toContain("Valida");
    expect(await verificarPassword("Valida.123", salt, passwordHash)).toBe(true);
    expect(await verificarPassword("Otra.1234", salt, passwordHash)).toBe(false);
  });
  test("la misma clave genera hashes distintos (sal aleatoria)", async () => {
    const a = await crearPasswordSeguro("Valida.123");
    const b = await crearPasswordSeguro("Valida.123");
    expect(a.passwordHash).not.toBe(b.passwordHash);
  });
});

describe("auth.service - JWT", () => {
  test("firma y verifica; el token lleva solo el id", () => {
    const payload = verificarToken(firmarToken({ _id: "abc123" }));
    expect(payload.id).toBe("abc123");
    expect(payload.rol).toBeUndefined(); // el rol se lee siempre de la base
  });
  test("un token alterado se rechaza con 401", () => {
    expect(() => verificarToken(firmarToken({ _id: "abc123" }) + "x")).toThrow(/Sesion invalida/);
  });
});
