// Lee una cookie desde un encabezado "Cookie" crudo. Se usa en el handshake de
// Socket.IO, donde cookie-parser (middleware de Express) no se ejecuta.
export function leerCookie(encabezado = "", nombre) {
  const par = encabezado.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${nombre}=`));
  return par ? decodeURIComponent(par.slice(nombre.length + 1)) : undefined;
}
