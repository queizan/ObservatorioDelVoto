# Tratamiento de participaciones de afinidad: borrador pendiente

**NO activar la recogida pública hasta completar el aviso jurídico.**

La herramienta calcula en el navegador 20 respuestas a cuestiones políticas. No envía esas respuestas ni perfiles individuales al servidor. La participación opcional transmitiría solo dos etiquetas de partido (primera y segunda afinidad) a un servicio Supabase para incrementarlas en contadores agregados; la base de datos diseñada no conserva registros individuales, direcciones IP ni identificadores de dispositivo.

Antes de activar esta función, el responsable de la web debe verificar y publicar:

- Identidad y contacto del responsable del tratamiento.
- Base jurídica y condiciones del consentimiento explícito cuando sea aplicable a opiniones políticas (artículo 9 RGPD).
- Información específica sobre el proveedor Supabase: ubicación de infraestructura, registros del proveedor, IP en conexiones y cualquier transferencia internacional.
- Finalidad del tratamiento, retención y derechos de los interesados. Dado que los datos se agregan sin identificación individual, no es técnicamente posible retirar una contribución concreta de la tabla; las personas deben ser informadas **antes** de participar.
- Medidas razonables para evitar participaciones automáticas y manipulación de estadísticas; el ejemplo SQL no ofrece CAPTCHA ni garantía un voto por persona.
- Comunicación clara de que esta herramienta NO es una encuesta electoral representativa.

El test puede publicarse con la recopilación de participación desactivada: basta con mantener `enabled: false` en `config/affinity-public.js`.
