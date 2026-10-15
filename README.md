# Observatorio del voto · 29N

Dashboard web estático y sin dependencias para seguir y comparar encuestas de intención de voto de las **elecciones generales españolas del 29 de noviembre de 2026**.

**Estado de los datos:** corte manual del **14 de octubre de 2026**. Contiene **35 encuestas nacionales** publicadas desde el 1 de septiembre por **18 institutos**. La fecha del sondeo y la de su publicación se distinguen en la ficha individual. Incluye el CIS. La web NO busca encuestas automáticamente.

## Publicar gratis en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo, `Observatorio-del-voto`).
2. Sube **todo el contenido de esta carpeta** a la raíz de la rama `main`: `index.html`, `app.js`, `styles.css`, `data/`, `assets/`, `scripts/`, `.nojekyll`, etc. Es importante que `index.html` quede en la **raíz**, no dentro de otra carpeta.
3. En GitHub abre **Settings → Pages**. En **Build and deployment**, elige **Deploy from a branch**; selecciona rama **main** y carpeta **/(root)** y guarda.
4. La página se publicará en `https://queizan.github.io/ObservatorioDelVoto/`. Si el repositorio es `TU_USUARIO.github.io`, quedará en `https://TU_USUARIO.github.io/`.

El dashboard y el cuestionario funcionan sin Vite ni npm. La **gráfica de participaciones agregadas** usa Supabase, que requiere completar una única migración SQL de los contadores. Las únicas credenciales públicas del frontend son la URL y la clave publicable de Supabase. También puedes abrir `index.html` directamente en el navegador para verla localmente.

## Estructura

- `index.html`: estructura del dashboard, páginas, accesibilidad y textos editoriales.
- `styles.css`: diseño responsive, tema claro y colores de los principales partidos.
- `app.js`: cálculos de promedios, filtros, gráficos SVG, comparación, tablas, fichas y descarga CSV.
- `data/polls.json`: **archivo fuente para editar las encuestas**. Las fechas están en formato ISO `AAAA-MM-DD`.
- `data/polls.js`: copia generada automáticamente para que la web funcione incluso desde `file://`.
- `scripts/sync-data.py`: valida y sincroniza los datos JSON a JS con Python 3 (sin paquetes externos).
- `.github/workflows/validate.yml`: comprobaciones automáticas en cada push.
- `assets/favicon.svg`: favicon original del proyecto.

## Añadir o actualizar encuestas

1. Edita `data/polls.json`. Copia un objeto existente dentro del array `polls` y cambia los campos. Da a cada encuesta un `id` **único**.
2. Completa `pollster`, `publisher`, `category`, `published`, `fieldworkStart`, `fieldworkEnd`, `sample`, `vote` (`PP`, `PSOE`, `VOX`, `SUMAR`), `seats` (solo si se publican), `sourceUrl` y `sourceType`.
3. Una encuesta nueva sin proyección de escaños debe llevar `"seats": {}`. **No inventes escaños** a partir de porcentajes nacionales. Si la proyección se da en un intervalo, en `seats` puedes introducir el punto medio y en `seatIntervals` el rango original.
4. Actualiza el límite `metadata.to` y `metadata.lastUpdated` a la última fecha incorporada. Si quieres modificar el texto fijo «Último corte de datos» del HTML y el nombre del archivo CSV exportado, edita también `index.html` y `app.js`.
5. Ejecuta desde la raíz del proyecto: `python3 scripts/sync-data.py`.
6. Sube **ambos** archivos `data/polls.json` y `data/polls.js` a GitHub. Los gráficos se recalculan al cargar la página.

El repositorio incluye un flujo de comprobación que te avisará si `data/polls.js` no coincide con `data/polls.json`.

## Metodología

Por defecto, la media de intención de voto usa una única encuesta —la última publicada— por cada instituto demoscópico dentro del periodo. Cada instituto tiene el mismo peso. Existe otra opción para incluir todas las publicaciones por igual, más el filtro para mostrar u ocultar el CIS. **Ninguna de las dos es un pronóstico oficial ni un modelo probabilístico**.

Las cifras de voto se muestran para PP, PSOE, Vox y Sumar. «Resto» es el porcentaje restante hasta 100 e incluye otros partidos nacionales y territoriales, incluido Podemos. Es una agrupación visual y no una estimación específica de un partido.

El bloque de escaños es la media de las **proyecciones publicadas**, no una transformación matemática del promedio de voto. Donde existe una horquilla de escaños, para la media se emplea su punto medio y la gráfica de rango utiliza los límites originales. El remanente hasta los 350 se identifica como «Otros». Debido a que los intervalos y las proyecciones de distintas empresas no son un modelo electoral coherente común, el resultado agregado es **ilustrativo**.

El estudio nacional del CEO catalán queda fuera de la media porque su universo es Cataluña y no España.

Los sondeos están fechados por **publicación** y también tienen la fecha de campo. Se excluyen reestimaciones independientes sobre la misma muestra del CIS y encuestas internas partidistas sin porcentajes completos. La fuente `sourceType: "recopilacion"` identifica enlaces de archivo secundarios que se deberán sustituir por enlaces directos si están disponibles.

## Precisión y revisión

Las publicaciones originales pueden actualizar cifras, títulos o estimaciones, y algunos resúmenes son de acceso restringido. El archivo es una recopilación editorial de datos y debe revisarse regularmente con fichas técnicas de los institutos. No repliques cifras de portada que sean escaños como si fueran porcentajes. Para comprobar la procedencia general:

- [CIS — catálogo de estudios](https://www.cis.es/es/estudios/catalogo)
- [Convocatoria oficial — BOE 806/2026](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742)
- [Histórico recopilatorio — Wikipedia](https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Spanish_general_election)

## Consideración legal sobre encuestas

Durante los **cinco días anteriores a la votación** existe una restricción legal a publicar o difundir sondeos electorales en España (LOREG art. 69.7). Antes de mantener un sitio público activo durante ese periodo, revisa la aplicación de la normativa con asesoramiento jurídico. Este repositorio constituye un corte de datos de octubre.

## Licencia

El repositorio definitivo conserva la licencia **CC0 1.0 Universal** que estableció su propietario (ver `LICENSE`). Esta declaración se refiere a los materiales que el titular puede licenciar; los programas electorales enlazados, datos de terceros, marcas y nombres comerciales conservan sus derechos respectivos. Los enlaces se ofrecen para identificar y verificar fuentes.


## Interacciones

El simulador de mayorías permite arrastrar o seleccionar PP, PSOE, Vox y Sumar para comprobar el umbral aritmético de 176 escaños. Los valores proceden del reparto ilustrativo; «Resto» agrupa varias formaciones y no se ofrece como bloque seleccionable. No modela pactos ni predice un gobierno.

El apartado **Última actualización** utiliza automáticamente las encuestas contenidas en `data/polls.json`, mostrando fecha de publicación, medio e instituto. Para las nuevas incorporaciones se recomienda establecer el campo opcional `addedAt` (`AAAA-MM-DD`) con la fecha de subida al archivo; cuando falta, se ordena por publicación.

Los meses del archivo, la fecha de corte visible y la escala temporal se actualizan cuando se regeneran los datos.

## Explorador de afinidad programática (v3 · 15 de octubre de 2026)

**Experimento didáctico, independiente y NO OFICIAL. No representa una encuesta estadística de intención de voto, ni una recomendación de partido o voto.**

- Cada visita recibe **30 preguntas aleatorias** de un banco de **54 preguntas** en **21 temas**. La selección estratificada cubre todos los temas al menos una vez antes de repetirlos.
- Las respuestas avanzan automáticamente y pueden revisarse con «Anterior». Se requieren al menos 18 respuestas sustantivas.
- Documentos de **2023** para **11 formaciones**: PP, PSOE, Vox, Sumar, ERC, Junts, EH Bildu, PNV, BNG, PACMA y Coalición Canaria (esta última representada por un manifiesto electoral de su coalición de 2023).
- Los programas y las fuentes están enlazados. Los partidos territoriales no se presentan en todas las circunscripciones. La inclusión no supone respaldar candidaturas futuras del 29N.
- Codificación editorial aproximada −2 a +2. Las posiciones no documentadas se guardan como `null`, **no como 0 (neutral)**. El resultado muestra cobertura: número de respuestas comparables por partido. Por debajo de seis, la puntuación se omite. Esta diversidad documental limita las comparaciones.
- Los archivos fuente y versión del programa son `data/affinity.json`; la versión web sincronizada es `data/affinity.js`. Nuevos partidos y nuevas propuestas se incorporan editando ese JSON y ejecutando `python3 scripts/sync-affinity.py`.
- La segunda afinidad se muestra solo localmente. El recuento colectivo **solo contabiliza la primera afinidad**, una etiqueta por envío.
- **No almacenamos respuestas, resultados individuales, identificadores de navegador, IP o historiales de participación en nuestra base de datos.** Las respuestas viven solo en memoria del navegador mientras se realiza el test; no se escriben en `localStorage`. El código limpia entradas del prototipo anterior si las hubiera.
- **No hay comprobación de persona única**: un participante puede realizar el test y compartirlo varias veces. Esto significa que el recuento es voluntario y puede sufrir manipulación, no es una muestra representativa. El SQL no incluye rate limiting.
- Al publicar voluntariamente, el frontend envía **solo una etiqueta de primera afinidad** a Supabase, que incrementa un contador. Los proveedores pueden procesar metadatos técnicos de conexión; por eso **no prometemos ausencia absoluta de rastros ni que ningún tercero procese esos datos**.

### Activar el recuento público: único paso pendiente

La dirección pública y la **publishable key** de Supabase están ya incorporadas en `config/affinity-public.js`; NO son claves secretas.

**Hay que ejecutar una única vez** en el SQL Editor del proyecto Supabase el archivo
[backend/supabase_affinity.sql](backend/supabase_affinity.sql).

Este script es **re-ejecutable**, amplía los cuatro partidos anteriores a once sin perder sus recuentos y actualiza la función `submit_affinity_vote(text)`. Tras pulsar **Run** y ver once filas, la web detecta el esquema actualizado automáticamente y habilita el envío para quienes marquen el consentimiento. Mientras falten partidos en la base de datos, el formulario seguirá bloqueado por seguridad y la portada explicará la migración pendiente. No se crean cifras ficticias.

### Privacidad y publicación responsable

Consulta [la nota de privacidad pendiente](docs/PRIVACIDAD-PENDIENTE.md). La interfaz ya avisa de que es un test no oficial, no representativo, de que se envía solo la primera etiqueta y de que los proveedores pueden tratar registros técnicos. Antes de promocionar la recopilación de afinidades políticas debe completarse la evaluación jurídica y el aviso identificando al responsable del proyecto; el consentimiento por sí solo puede ser insuficiente para legitimar determinados tratamientos en España. **No se ha verificado que esta instalación cumpla por sí sola todos los requisitos de RGPD y LOPDGDD.**

### Mantenimiento

Edita `data/affinity.json` y ejecuta `python3 scripts/sync-affinity.py`. La validación de GitHub Actions comprueba diversidad, estructura y archivos sincronizados. Las encuestas demoscópicas se mantienen independientes del cuestionario voluntario.
