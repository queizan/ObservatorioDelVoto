# Información de privacidad del test · nota previa a la publicación pública

**Proyecto no oficial, sin vinculación con partidos, autoridades electorales o institutos de encuestas.** El cuestionario no es una encuesta representativa ni mide intención efectiva de voto.

## Funcionamiento técnico minimizado

- Las 30 respuestas se procesan localmente en la memoria del navegador durante el test; el sitio no las envía a Supabase ni las almacena en nuestra base de datos.
- No pedimos cuenta, nombre ni correo; no generamos una huella de dispositivo ni bloqueamos participaciones repetidas.
- El botón opcional envía una sola categoría: la **primera afinidad programática**. Una función de Supabase solo aumenta en uno el contador agregado de ese partido (los resultados individuales no se guardan).
- El resultado puede repetirse con otro test. Es un total de **participaciones**, no de personas únicas.
- **Los proveedores de infraestructura (GitHub Pages, Supabase, redes intermedias) podrían registrar dirección IP u otros datos técnicos al servir la página o recibir la solicitud.** No podemos garantizar ausencia absoluta de rastros ni que ningún tercero procese información técnica.
- Los contadores se publican en forma agregada en la portada, indicando porcentaje respecto del total de envíos. La muestra es voluntaria y autoseleccionada.

## Antes de promocionar el formulario

Pendiente de completar y verificar por el responsable del proyecto:
- Identidad, contacto y domicilio / modo de contacto del responsable del tratamiento.
- Base jurídica adecuada, en particular por tratarse de inferencias relacionadas con opiniones políticas (RGPD artículo 9 y artículo 9.1 de la LOPDGDD; el consentimiento aislado puede no ser suficiente).
- Información sobre contratos, registros técnicos, ubicación y transferencias de los proveedores.
- Plazos de conservación, derechos, y necesidad o no de evaluación de impacto.
- Adecuación del mecanismo de participación y de cualquier consentimiento relativo a tecnologías de almacenamiento local.
- Proteger el recuento si la manipulación pública se vuelve un problema: actualmente no tiene garantía antifraude ni límite por persona.

**La inclusión de un consentimiento en el frontend no acredita por sí sola cumplimiento de protección de datos.** Si necesitas mantener apagado el recuento hasta el cierre de esta revisión, establece `enabled: false` en `config/affinity-public.js`.
