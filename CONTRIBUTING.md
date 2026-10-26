# Guía de colaboración (Git / GitHub Desktop)

**Ramas:** `main` (estable, solo por Pull Request) · `develop` (integración) · una rama por integrante/tarea:
`feat/base-y-config` (Fiorella), `feat/clientes-usuarios-auth` (Malena), `feat/productos-repartidores-front` (Axel), `feat/pedidos-auditoria-tests` (Javier).

**Commits:** `tipo(modulo): descripción breve` — tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
Ej.: `feat(pedidos): valida transiciones de estado`.

**Integrar con Pull Request:** 1) commit y push de tu rama; 2) *Create Pull Request* hacia `develop`; 3) otro integrante revisa y aprueba; 4) *Merge*; 5) todos hacen *Fetch/Pull* de `develop`. Al terminar, PR de `develop` a `main`.
**Nunca subir:** `.env` ni `node_modules` (están en `.gitignore`).
