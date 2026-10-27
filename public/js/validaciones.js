// ============================================================
// VALIDACIONES.JS (navegador) - CAPA 1: FRONTEND
// ============================================================
// Valida el formulario ANTES de hacer el fetch, para avisar al usuario
// enseguida y evitar viajes innecesarios al servidor. Usa los mismos
// atributos del HTML (required, min, type) y las mismas reglas
// (reglas.js) que el backend y la base de datos.
// OJO: no reemplaza al backend; el servidor valida SIEMPRE de nuevo,
// porque el JavaScript del navegador se puede saltear.
// ============================================================
import { errorEmail, errorPassword } from "./reglas.js";

export function validarFormulario(form, { esAlta = true } = {}) {
  const errores = [];
  const agregar = (campo, mensaje) => errores.push({ campo, mensaje });

  for (const campo of form.elements) {
    if (!campo.name || campo.tagName === "BUTTON") continue;
    const etiqueta = form.querySelector(`label[for="${campo.id}"]`)?.textContent.split("(")[0].trim() || campo.name;
    const valor = campo.name === "password" ? campo.value : campo.value.trim(); // la clave no se recorta

    if (campo.name === "password") {
      // Alta: obligatoria. Edicion: vacia = "no cambiar".
      if (valor === "" && esAlta) agregar("password", "La contraseña es obligatoria.");
      else if (valor !== "") { const e = errorPassword(valor); if (e) agregar("password", e); }
      continue;
    }
    if (campo.required && valor === "") { agregar(campo.name, `${etiqueta}: campo obligatorio.`); continue; }
    if (valor === "") continue;
    if (campo.type === "email") { const e = errorEmail(valor); if (e) agregar(campo.name, e); }
    if (campo.type === "number" && (Number.isNaN(Number(valor)) || (campo.min !== "" && Number(valor) < Number(campo.min))))
      agregar(campo.name, `${etiqueta}: debe ser un número mayor o igual a ${campo.min}.`);
  }

  // Un usuario con rol "repartidor" debe estar vinculado a un repartidor.
  if (form.elements.rol?.value === "repartidor" && form.elements.repartidor && !form.elements.repartidor.value)
    agregar("repartidor", "Un usuario repartidor debe estar vinculado a un repartidor.");

  return errores;
}