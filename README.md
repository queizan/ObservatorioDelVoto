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


## Gobiernos a examen (desde 2000)

La pestaña `#gobiernos` recupera el proyecto histórico de comparación de ejecutivos españoles desde 2000. Se organiza por **8 mandatos**, 4 presidentes y los partidos PP/PSOE. Datos y criterios:

- `data/governments.json`: referencia única de presidentes, mandatos, indicadores, contextos, hitos legales, documentación judicial, fuentes y N/D.
- `python3 scripts/sync-governments.py`: valida la estructura y genera `data/governments.js`. Las pruebas automáticas utilizan `node scripts/test-governments.js`.
- **Deuda pública** anual (% PIB, BdE/Eurostat), **desempleo** anual estimado OIT/Banco Mundial (no EPA), **saldo público** anual (M€, Eurostat/BdE) y **gasto total** anual (% PIB, Eurostat; N/D en años no contrastados).
- Periodos de referencia de años completos para cada mandato. Los años de cambio de gobierno incluyen actuaciones de dos ejecutivos. No hay atribución causal automática.
- Paneles interactivos: dos gobiernos, indicadores de entrada→salida y variación exacta, popups de objetivo, actuación, resultado y justificación de la nota; medidas sustentadas por BOE, crisis, justicia/corrupción, comparativa agregada PP/PSOE y metodología.
- Las notas numéricas y la cuantificación de promesas quedan `N/D` hasta verificar una rúbrica homogénea completa. Nunca presentar investigación como condena ni un importe investigado como perjuicio probado. Distinguir condena penal de responsabilidad civil.
- Futuros indicadores (sanidad, educación, defensa, I+D, vivienda, desigualdad, salarios reales, migración y natalidad) quedan marcados `N/D` hasta incorporar series comparables. No inferir que no existan datos ni casos por su ausencia en la selección inicial.
