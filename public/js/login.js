// Pagina de login: envia usuario/clave con fetch; si es correcto el servidor deja la cookie con el JWT y se entra al panel.
import { api } from "./api.js";
import { mostrarErrores, mostrarMensaje } from "./ui.js";

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
    await api.post("/api/auth/login", datos); // el servidor responde con la cookie httpOnly (JWT)
    location.href = "/panel";
  } catch (error) {
    mostrarErrores(error.errores);
    mostrarMensaje(error.message, "error");
  }
});
