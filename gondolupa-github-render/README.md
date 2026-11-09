# Gondolupa · Montevideo

Comparador de precios con una portada en `/` y la aplicación en `/comparar`. Es un servicio Node.js que consulta catálogos externos.

- [Publicar en GitHub y Render](PUBLICAR.md)
- [Uso, cobertura y límites](LEEME.md)
- [Estado del proyecto](PROGRESO.md)

Para probarlo localmente con Node 24 y pnpm: `pnpm install --frozen-lockfile`, `pnpm test` y `pnpm start`. El servidor local escucha en http://localhost:8877.

Este paquete contiene el código y los catálogos de referencia. Las bases de datos, las claves privadas y las listas del navegador quedan fuera del repositorio.
