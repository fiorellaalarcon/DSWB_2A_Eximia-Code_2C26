// Pagina de login: envia usuario/clave con fetch y, si es correcto, guarda el usuario y entra al panel.
import { api } from "./api.js";
import { guardarUsuario, obtenerUsuario } from "./auth.js";
import { mostrarErrores, mostrarMensaje } from "./ui.js";

if (obtenerUsuario()) location.href = "/panel"; // ya ingreso antes

document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault(); // sin recargar la pagina
  // En el login solo se exige completar los campos (la regla de la clave se aplica al CREAR el usuario).
  const faltantes = [...e.target.elements].filter((c) => c.name && c.required && !c.value.trim());
  if (faltantes.length) {
    mostrarErrores(faltantes.map((c) => ({ campo: c.name, mensaje: `Complete el campo ${c.name}.` })));
    return mostrarMensaje("Complete usuario y contraseña.", "error");
  }
  const datos = Object.fromEntries(new FormData(e.target));
  try {
    const respuesta = await api.post("/api/auth/login", datos);
    guardarUsuario(respuesta.usuario);
    location.href = "/panel";
  } catch (error) {
    mostrarErrores(error.errores);
    mostrarMensaje(error.message, "error");
  }
});
