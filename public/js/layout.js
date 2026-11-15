// Comportamiento comun del encabezado: cerrar sesion y menu desplegable en celulares.
import { cerrarSesion } from "./auth.js";

document.getElementById("btnSalir")?.addEventListener("click", cerrarSesion);

const btnMenu = document.getElementById("btnMenu");
btnMenu?.addEventListener("click", () => {
  const abierto = document.getElementById("menu").classList.toggle("abierto");
  btnMenu.setAttribute("aria-expanded", String(abierto)); // accesibilidad
});
