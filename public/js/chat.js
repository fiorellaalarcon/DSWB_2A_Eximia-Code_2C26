// ============================================================
// CHAT.JS (navegador) - Chat en tiempo real con Socket.IO (Bloque 11.1)
// ============================================================
// El navegador se conecta con io(): la cookie con el JWT viaja sola en el
// handshake y el servidor decide si deja entrar. Los mensajes se dibujan con
// textContent (nunca innerHTML) para que nadie pueda inyectar HTML.
// ============================================================
import { protegerPagina } from "./auth.js";
import { el, mostrarMensaje } from "./ui.js";

const usuario = protegerPagina();
const historial = document.getElementById("historial");
const conectados = document.getElementById("conectados");
const form = document.getElementById("formChat");
const campo = document.getElementById("textoChat");

const socket = io(); // script /socket.io/socket.io.js cargado en chat.pug

function dibujar(m) {
  const clase = m.rol === "ia" ? "mensaje-ia" : m.usuario === usuario.nombre ? "mensaje-propio" : "mensaje-otro";
  const hora = new Date(m.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  historial.append(
    el("div", { className: `chat-mensaje ${clase}` },
      el("div", { className: "chat-autor" }, el("strong", { textContent: m.usuario }), el("small", { textContent: ` · ${m.rol === "ia" ? "IA" : m.rol} · ${hora}` })),
      el("div", { textContent: m.texto }))
  );
  historial.scrollTop = historial.scrollHeight; // baja hasta el ultimo mensaje
}

socket.on("connect", () => (conectados.textContent = "Conectado."));
socket.on("connect_error", () => {
  conectados.textContent = "No se pudo conectar al chat.";
  mostrarMensaje("No autorizado: inicie sesión nuevamente.", "error");
});
socket.on("conectados", (n) => (conectados.textContent = `Personas conectadas: ${n}`));
socket.on("historial", (mensajes) => { historial.replaceChildren(); mensajes.forEach(dibujar); });
socket.on("mensaje", dibujar);
socket.on("aviso", (texto) => mostrarMensaje(texto, "error"));

form.addEventListener("submit", (e) => {
  e.preventDefault(); // sin recargar
  const texto = campo.value.trim();
  if (!texto) return;
  socket.emit("mensaje", { texto }); // el nombre lo pone el servidor, no el navegador
  campo.value = "";
});
