const fs = require("fs/promises");
const path = require("path");

// Helper reutilizable para persistir información en archivos JSON.
// Así los controladores no repiten la lógica de lectura/escritura.
async function readJson(fileName) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function writeJson(fileName, data) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = { readJson, writeJson };