# Diagramas (Ingeniería de Software aplicada al backend de FreshRoute)

Los diagramas están en **Mermaid**: GitHub los dibuja directamente en este archivo.

## 1. Casos de uso
```mermaid
flowchart LR
  ADM([Administrativo])
  DEP([Operador de depósito])
  PLA([Planificador])
  REP([Repartidor])
  DIR([Directivo])
  SIS([Administrador de sistemas])
  subgraph FreshRoute
    CU1([Iniciar y cerrar sesión])
    CU2([Gestionar clientes y productos])
    CU3([Crear y editar pedido Pendiente])
    CU4([Preparar pedido])
    CU5([Gestionar repartidores])
    CU6([Despachar pedido con repartidor disponible])
    CU7([Ver mis pedidos y confirmar entrega])
    CU8([Cancelar pedido])
    CU9([Consultar pedidos por cliente y estado])
    CU10([Consultar historial y auditoría])
    CU11([Gestionar usuarios y reactivar registros])
    CU12([Chatear y consultar al asistente IA])
  end
  ADM --> CU1 & CU2 & CU3 & CU8 & CU9 & CU12
  DEP --> CU1 & CU4 & CU9 & CU12
  PLA --> CU1 & CU5 & CU6 & CU8 & CU9 & CU12
  REP --> CU1 & CU7 & CU12
  DIR --> CU1 & CU9 & CU10 & CU12
  SIS --> CU1 & CU11 & CU10 & CU12
```

## 2. Diagrama de clases (modelo de dominio)
```mermaid
classDiagram
  class Usuario {
    +String nombre
    +String usuario
    +String passwordHash
    +String salt
    +String rol
    +Boolean activo
    +verificarPassword(clave) Boolean
  }
  class Cliente {
    +String nombre
    +String email
    +String direccion
    +String telefono
    +Boolean activo
  }
  class Producto {
    +String nombre
    +Number precio
    +Boolean activo
  }
  class Repartidor {
    +String nombre
    +String telefono
    +String patente
    +Boolean disponible
    +Boolean activo
  }
  class Pedido {
    +String estado
    +Number total
    +ItemPedido[] items
    +HistorialEstado[] historialEstados
  }
  class ItemPedido {
    +Number cantidad
    +Number precioUnitario
  }
  class HistorialEstado {
    +String estado
    +Date fecha
  }
  class Auditoria {
    +String accion
    +String entidad
    +String detalle
    +Date fecha
  }
  Cliente "1" --> "0..*" Pedido : realiza
  Pedido "1" *-- "1..*" ItemPedido : contiene
  ItemPedido "*" --> "1" Producto : refiere a
  Pedido "*" --> "0..1" Repartidor : asignado a
  Pedido "1" *-- "1..*" HistorialEstado : registra
  Usuario "0..1" --> "1" Repartidor : cuenta del chofer
  Usuario "1" --> "0..*" Auditoria : genera
  HistorialEstado "*" --> "1" Usuario : realizado por
```

## 3. Modelo de datos (entidad–relación, MongoDB)
```mermaid
erDiagram
  CLIENTE ||--o{ PEDIDO : realiza
  PEDIDO ||--|{ ITEM_PEDIDO : contiene
  PRODUCTO ||--o{ ITEM_PEDIDO : "se vende en"
  REPARTIDOR |o--o{ PEDIDO : entrega
  USUARIO |o--o| REPARTIDOR : "es la cuenta de"
  USUARIO ||--o{ AUDITORIA : genera
  PEDIDO ||--|{ HISTORIAL_ESTADO : registra
  USUARIO {
    ObjectId _id PK
    string usuario UK
    string passwordHash
    string salt
    string rol
    ObjectId repartidor FK
    boolean activo
  }
  CLIENTE {
    ObjectId _id PK
    string email UK
    string nombre
    string direccion
    boolean activo
  }
  PRODUCTO {
    ObjectId _id PK
    string nombre
    number precio
    boolean activo
  }
  REPARTIDOR {
    ObjectId _id PK
    string nombre
    boolean disponible
    boolean activo
  }
  PEDIDO {
    ObjectId _id PK
    ObjectId cliente FK
    ObjectId repartidor FK
    string estado
    number total
  }
  ITEM_PEDIDO {
    ObjectId producto FK
    number cantidad
    number precioUnitario
  }
  HISTORIAL_ESTADO {
    string estado
    date fecha
    ObjectId usuario FK
  }
  AUDITORIA {
    ObjectId usuario FK
    string accion
    string entidad
    date fecha
  }
```
`ITEM_PEDIDO` y `HISTORIAL_ESTADO` están **embebidos** dentro del documento `pedidos` (se leen siempre junto con el pedido); el resto son colecciones con referencias.

## 4. Secuencia: inicio de sesión con JWT en cookie
```mermaid
sequenceDiagram
  actor U as Usuario
  participant N as Navegador (login.js)
  participant R as Ruta /api/auth/login
  participant C as auth.controller
  participant S as auth.service
  participant DB as MongoDB
  U->>N: usuario y contraseña
  N->>R: POST /api/auth/login (fetch)
  R->>R: validarLogin (middleware)
  R->>C: login
  C->>DB: buscar usuario activo (+passwordHash, +salt)
  C->>S: verificarPassword (PBKDF2 + sal)
  S-->>C: coincide
  C->>S: firmarToken (JWT con el id)
  C-->>N: 200 + Set-Cookie token (httpOnly)
  N->>R: GET /panel (el navegador envía la cookie)
  R->>DB: protegerVista: verifica JWT y lee el rol
  R-->>U: página del panel
```

## 5. Secuencia: cambio de estado de un pedido con aviso en tiempo real
```mermaid
sequenceDiagram
  actor D as Depósito
  participant N as Navegador
  participant API as PATCH /api/pedidos/:id/estado
  participant SV as pedidos.service
  participant DB as MongoDB
  participant IO as Socket.IO
  participant O as Otras pantallas abiertas
  D->>N: clic en "→ Preparado"
  N->>API: fetch PATCH (cookie JWT)
  API->>API: identificarUsuario, permitirRoles, validarCambioEstado
  API->>SV: cambiarEstadoPedido
  SV->>SV: ¿transición válida? (409) ¿rol autorizado? (403)
  SV->>DB: guardar estado e historial + auditoría
  SV->>IO: emit pedido:actualizado {id, estado}
  SV-->>N: 200 pedido actualizado
  IO-->>O: pedido:actualizado
  O->>API: GET /api/pedidos (vuelven a pedir con sus permisos)
```

## 6. Secuencia: chat con el asistente IA
```mermaid
sequenceDiagram
  actor P as Persona
  participant CH as chat.js
  participant SK as chatSocket (Socket.IO)
  participant CX as contexto.service
  participant G as geminiService
  participant GM as API de Gemini
  P->>CH: "@gemini ¿cuántos pedidos hay pendientes?"
  CH->>SK: emit mensaje (cookie JWT en el handshake)
  SK->>SK: valida texto, limita consultas, nombre desde el servidor
  SK-->>CH: mensaje a todos los conectados
  SK->>CX: resumenOperativo (cantidades por estado, según rol)
  SK->>G: consultarIA(pregunta, datos)
  G->>GM: prompt de FreshRoute + datos + pregunta
  GM-->>G: respuesta
  SK-->>CH: mensaje del Asistente (IA) a todos
```
