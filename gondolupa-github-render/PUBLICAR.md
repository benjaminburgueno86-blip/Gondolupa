# Publicar Gondolupa en GitHub y Render

El paquete está preparado para subirlo. Aún no se creó el repositorio ni se desplegó el servicio.

## 1. GitHub

1. Iniciá sesión en [GitHub](https://github.com/) y creá un repositorio **privado** llamado `gondolupa`.
2. Descomprimí el ZIP. Subí **los archivos de adentro**, no el ZIP ni la carpeta que los contiene. En GitHub elegí **Upload files**. Incluí `.gitignore` y `.node-version` si el selector los oculta.
3. Verificá que `README.md`, `server.mjs`, `package.json`, `pnpm-lock.yaml` y `render.yaml` aparezcan en la raíz del repositorio. Confirmá los cambios en la rama principal.

[Guía de carga de archivos de GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## 2. Render

1. En [Render](https://dashboard.render.com/), elegí **New → Blueprint**. Conectá GitHub y dale acceso al repositorio `gondolupa`.
2. Seleccioná el repositorio y su rama principal. Render lee `render.yaml` desde la raíz. Revisá que indique un **Web Service** de Node y el plan **Free**. Aplicá la configuración cuando quieras hacer el primer despliegue. Los cambios posteriores en GitHub no se despliegan automáticamente con esta configuración.
3. Cuando aparezca **Live**, abrí la URL que te asigna Render. La portada está en `/`, el comparador en `/comparar` y la verificación en `/healthz`.

Si preferís **New → Web Service**, estos son los valores para configurarlo a mano:

| Campo | Valor |
| --- | --- |
| Runtime | Node |
| Root Directory | Dejar vacío |
| Build Command | `pnpm install --frozen-lockfile && pnpm test` |
| Start Command | `pnpm start` |
| Health Check Path | `/healthz` |
| Auto-Deploy | Off |
| Variable `HOST` | `0.0.0.0` |
| Variable `NODE_VERSION` | `24.22.1` |

Render asigna el puerto. No hace falta fijar `PORT`.

## 3. Primera prueba en Render

- Abrí la portada, entrá al comparador y buscá «Oreo». Comprobá que al menos una tienda responda y que se muestre la fecha de consulta. Los catálogos pueden responder distinto desde Render; las pruebas locales no comprueban eso.
- Agregá una oferta, abrí el carrito y recargá. La referencia y la tienda deberían conservarse en ese navegador; actualizá para recuperar el precio.
- Comprobá que `/healthz` devuelva `{"status":"ok"}` y que `/data/gondolupa.sqlite` devuelva 404.

El plan gratuito sirve para probar. Render suspende el servicio cuando queda inactivo y puede perder el historial, los reportes y las suscripciones a alertas al reiniciar. Las listas guardadas en localhost no aparecen automáticamente en el dominio de Render; exportalas e importalas si querés trasladarlas. Si más adelante necesitás conservar los datos del servidor, revisá el ejemplo opcional `render.production.yaml` (plan pago con disco persistente).

Documentación oficial: [Blueprints](https://render.com/docs/infrastructure-as-code), [servicios gratuitos](https://render.com/docs/free) y [discos persistentes](https://render.com/docs/disks).
