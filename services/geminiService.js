// ============================================================
// SERVICES / GEMINISERVICE.JS
// ============================================================
// Basado en el ejemplo de clase (Bloque 11.2), con estas MEJORAS:
//  - La API key se lee de .env (GEMINI_API_KEY) y si falta NO rompe la app:
//    el asistente responde que no esta configurado.
//  - El modelo se configura con GEMINI_MODEL (por defecto gemini-2.5-flash),
//    asi se puede cambiar si Google lo reemplaza, sin tocar el codigo.
//  - El prompt se lee con una ruta relativa al archivo (no al directorio de
//    ejecucion) y se guarda en memoria.
//  - Recibe datos operativos reales y tiene un tiempo maximo de espera.
// ============================================================
import fs from "node:fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../utils/AppError.js";

const TIEMPO_MAXIMO_MS = 15000;
let modelo; // se crea la primera vez que se usa
let instrucciones; // contenido de prompts/asistente-freshroute.txt

export const iaConfigurada = () => Boolean(process.env.GEMINI_API_KEY);

async function obtenerModelo() {
  if (!iaConfigurada()) throw new AppError("El asistente de IA no esta configurado (falta GEMINI_API_KEY).", 503);
  modelo ??= new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
  instrucciones ??= await fs.readFile(new URL("../prompts/asistente-freshroute.txt", import.meta.url), "utf-8");
  return modelo;
}

export async function consultarIA(pregunta, datosOperativos = "") {
  const model = await obtenerModelo();
  const prompt = `${instrucciones}\n\nDatos operativos actuales:\n${datosOperativos}\n\nConsulta del usuario:\n${pregunta}`;

  const espera = new Promise((_, rechazar) =>
    setTimeout(() => rechazar(new AppError("El asistente tardo demasiado en responder.", 504)), TIEMPO_MAXIMO_MS)
  );
  const resultado = await Promise.race([model.generateContent(prompt), espera]);
  return resultado.response.text();
}
