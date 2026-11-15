// Pruebas UNITARIAS con Jest (Modulo 13): funciones puras, sin base de datos ni servidor.
import { describe, test, expect } from "@jest/globals";
import { errorEmail, errorPassword } from "../../public/js/reglas.js";

describe("reglas.js - politica de contrasena", () => {
  test.each(["Valida.123", "Abcdefg,h", "Ñandu_2026x"])("acepta %s", (clave) => {
    expect(errorPassword(clave)).toBeNull();
  });
  test.each([
    ["Corta.1", "menos de 8 caracteres"],
    ["sinmayuscula.1", "sin mayuscula"],
    ["SINMINUSCULA.1", "sin minuscula"],
    ["SinCaracter1234", "sin caracter especial"],
    ["", "vacia"],
    [undefined, "no es texto"],
  ])("rechaza %s (%s)", (clave) => {
    expect(errorPassword(clave)).toMatch(/8 caracteres/);
  });
});

describe("reglas.js - email", () => {
  test("acepta un email con arroba y dominio", () => expect(errorEmail("central@freshroute.test")).toBeNull());
  test.each(["sinarroba", "a@b", "@dominio.com", "con espacio@x.com", ""])("rechaza %s", (mail) => {
    expect(errorEmail(mail)).not.toBeNull();
  });
});
