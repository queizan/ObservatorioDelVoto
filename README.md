# Observatorio del Voto · 29N
Web estática en GitHub Pages que presenta encuestas nacionales españolas y documentación electoral verificada, con separación histórica entre Sumar y Frente Amplio en los sondeos.

## Puesta en marcha
Sirve los archivos estáticos con un servidor web o publica `main` en GitHub Pages. No requiere npm ni una base de datos. La página carga `data/polls.js`, `app.js`, `data/programmes.js` y `program-documents.js`.

## Encuestas
- Fuente de verdad: `data/polls.json`.
- Generación: `python3 scripts/sync-data.py`.
- Mantener `data/polls.js` sincronizado, un sondeo por instituto y medición; evitar duplicados de medios y no sumar simultáneamente candidaturas distintas.
- La media es descriptiva, no pronóstico electoral.

## Programas y documentos
- Sección principal: `#documentos`, con pestañas **Comparar programas** y **Biblioteca de documentos**.
- El comparador permite elegir dos formaciones, intercambiarlas, filtrar por 15 temas y mostrar todas las formaciones para un tema.
- Las propuestas son resúmenes editoriales neutros y verificables, con enlace a la fuente. Las casillas `null` se muestran como **sin propuesta verificable en las fuentes revisadas**; no atribuir silencio al partido sin leer íntegramente el texto.
- Se distingue entre programas completos de 2026, referencias históricas de 2023 y complementos de campaña. Para sustituir un programa, comprobar que el nuevo es oficial y completo y conservar el anterior en `history`.
- Datos: `data/programmes.json`. Se genera con `python3 scripts/sync-programmes.py` → `data/programmes.js`.
- Para actualizar una posición añadir `positions[partido][tema]={summary,sourceTitle,sourceUrl,year,sourceKind,reviewed}`; usar `null` cuando la propuesta no esté suficientemente contrastada. Revisar que la fuente sea la versión vigente de ese partido.
- Los programas de Cataluña, Euskadi, Galicia y Canarias presentan propuestas de alcance territorial específico; contextualizarlas, no generalizarlas como si fueran medidas para todo el Estado.

## Eliminación de cuestionario
El test de afinidad, sus 54 preguntas, scripts, configuración de envío a Supabase y consulta de resultados han sido eliminados de esta web y del repositorio operativo. Ninguna de las nuevas secciones recoge respuestas ni solicita identificadores personales. **Borrar el código de GitHub no elimina automáticamente una base de datos externa de Supabase** si fue activada antes: ese servicio requeriría una gestión independiente por su administrador. Los commits antiguos de GitHub conservan su historia.

## Validaciones
`python3 scripts/sync-data.py && python3 scripts/sync-programmes.py && node scripts/test-candidacy.js && node scripts/test-programmes.js`
La CI valida la integridad y la sintaxis JS y comprueba que los archivos generados están confirmados en la rama.

## Auditoría y publicación
Las auditorías verificadas se guardan en `reports/checks/`. Los cambios deben publicarse exclusivamente en `queizan/ObservatorioDelVoto`, rama `main` y comprobar GitHub Actions y GitHub Pages. Sin novedades no publicar despliegues solo para emitir un informe.
