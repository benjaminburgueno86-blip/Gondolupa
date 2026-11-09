# Gondolupa 1.5 · Montevideo

Versión local guardada el 20/10/2026. No se publicó ni se creó un nuevo enlace público.

## Abrir y ejecutar

En esta computadora: http://localhost:8879/comparar. El servidor debe permanecer encendido.

Para una instalación nueva se requiere Node.js 24.5 o superior y las dependencias de package.json: ejecutá `npm install` o `pnpm install --frozen-lockfile`. Luego `npm start` (puerto predeterminado 8877). En PowerShell, `$env:PORT='8879'` permite usar el puerto de esta instalación. No se incluyen node_modules ni datos personales en el ZIP.

## Diseño y compra

La búsqueda, el carrito, las listas, las sucursales, las promociones y la ayuda tienen pestañas propias. Las herramientas secundarias del carrito empiezan plegadas. Se agrega cada oferta con su tienda elegida; el carrito conserva esa elección. Al recargar es necesario actualizar precios y disponibilidad. Las listas se guardan en este navegador y pueden exportarse; no se sincronizan entre dispositivos.

## Fuentes reales y límites

Cinco cadenas aportan precios: Disco, Devoto, El Dorado, Frog y ahora Ta-Ta. Se consultan hasta ocho coincidencias por cadena. Los códigos GTIN se validan antes de combinar productos: los identificadores internos de Ta-Ta no se presentan como códigos de barras ni se fusionan por nombre. Las imágenes provienen de las fichas oficiales y pueden faltar o cambiar.

Solo Frog permite verificar el contexto de una sucursal elegida mediante una sesión anónima aislada. Disco y Devoto indican el contexto que devuelve su catálogo; El Dorado y Ta-Ta ofrecen precios online. Elegir un local cercano no garantiza precio ni stock en ese local. Tienda Inglesa sigue pendiente: su fuente rechaza el acceso automático. No se elude esa restricción.

El directorio fechado tiene 147 locales: 21 Disco, 46 Devoto, 46 Ta-Ta, 28 Frog y 6 El Dorado. Es una captura, no un registro de aperturas y cierres en tiempo real. Cada local muestra fuente y fecha.

## Dirección y mapa

Además del GPS, se puede escribir una dirección o elegir un punto en el mapa. La búsqueda manual envía el texto a Nominatim/OpenStreetMap; no hay autocompletado ni registro de direcciones en la base. La caché de búsqueda dura una hora. El mapa carga teselas externas solo al abrirlo. Las distancias son en línea recta y no representan tiempos de viaje. El GPS depende del navegador y del dispositivo; el navegador integrado agotó la espera en las pruebas anteriores. La dirección pública Plaza Independencia sí se verificó con búsqueda, mapa y recomendaciones.

## Gastos y promociones

Las tarifas publicadas se vuelven a comprobar cada 24 horas y dejan de usarse automáticamente si cambia el texto conocido o falla la fuente. Requieren que el usuario confirme zona, modalidad y productos elegibles.

- Ta-Ta: envío $239 y gratis por compras estrictamente mayores a $3.490; retiro elegible gratuito. El mínimo no está especificado y queda pendiente.
- El Dorado: mínimo $500 en supermercado; envío gratuito por compras estrictamente mayores a $4.000 en zonas habilitadas. Por debajo, el envío queda desconocido. Retiro gratuito con mínimo $500.
- Las otras cadenas requieren completar gastos y mínimos confirmados. Vacío significa desconocido; nunca se supone gratuito.

Fuentes: https://www.tata.com.uy/lp/preguntas-frecuentes y https://www.eldorado.com.uy/institucional/envios. No se incluye traslado personal en esas tarifas. Los totales incompletos no se presentan como la mejor compra.

Se mantienen las ofertas de catálogo y campañas publicadas con vigencia y condiciones. No se acumulan automáticamente cupones o beneficios incompatibles. El asistente de compra utiliza historia estadística SIPC y campañas verificadas; no promete precios futuros de una sucursal y se abstiene sin una coincidencia suficiente.

## Alertas opcionales

Las alertas locales siguen disponibles. Se agregó Web Push para avisar con la página cerrada, si el usuario lo activa y concede el permiso. El servidor debe permanecer funcionando, BACKGROUND_REFRESH debe estar habilitado y el navegador/proveedor debe admitir la entrega. Se revisa una muestra rotativa de hasta 20 búsquedas cada 30 minutos. Hay límites, deduplicación y pausa entre avisos; no garantiza detectar todas las variaciones.

Las suscripciones se separan por navegador, se eliminan al vencer y caducan tras 90 días sin sincronización. No se envían correos. Para Apple se debe configurar PUSH_SUBJECT con un contacto HTTPS o mailto del responsable. La lógica de envío pasó pruebas con un emisor simulado; no se activaron permisos ni se comprobó una notificación real al usuario.

## Operación local

Los datos viven en data/ (o DATA_DIR). Hay copias consistentes diarias de las bases, con retención de siete copias por base, y respaldo de las claves privadas de notificación. Son copias en esta computadora: falta una copia externa para recuperación ante pérdida del equipo.

Herramientas del responsable: `node admin.mjs status`, `node admin.mjs reports`, `node admin.mjs resolve-report ID` y `node admin.mjs backup`. Los avisos de error se guardan localmente; no existe un equipo de atención ni envío automático de esos avisos a una persona. El panel Ayuda muestra fuentes y formulario de incidencias. No hay panel administrativo público.

No compartir data/, archivos .env, claves push ni bases SQLite. Para restaurar notificaciones deben conservarse tanto la base de alertas como sus claves privadas. Consultá privacy.html para datos y retención.

## Validación

38 pruebas: `npm test`. Se comprobaron en navegador la búsqueda real de Ta-Ta, su elección en el carrito, la dirección pública y el mapa, las pestañas y los controles de tarifas. Pendientes de acceso externo: Tienda Inglesa, precios y stock por sucursal de las demás cadenas y entrega real de Web Push.
