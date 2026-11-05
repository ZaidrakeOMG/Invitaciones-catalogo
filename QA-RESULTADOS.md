# Verificación de entrega V6

**Revisado en este entorno**

- 14 URLs de demostraciones conservadas y localizadas exclusivamente en el portafolio.
- 6 fotografías de pases reales conservadas en `public/passes/`; ninguna se referencia como portada de invitación web.
- La única captura aportada de portada web es Zaid & Camila.
- Las vistas embebidas se deshabilitan para interacción y poseen enlaces externos a las demostraciones.
- El video NFC carece de pista de audio (ffprobe reporta solo stream de video) y el reproductor está configurado `muted`.
- CSS sin errores sintácticos reportados por el analizador; archivos TypeScript de datos y scripts sin errores en revisión individual con `tsc`.
- Navegación y contenido comercial revisados; WhatsApp y TikTok presentes, sin precios inventados.

**Pendiente de ejecutar en la computadora de publicación**

- `npm install` y `npm run build` para validación completa del compilador Astro, porque el registro npm no estaba disponible en este entorno.
- Pruebas finales visuales en navegador real, móvil y escritorio. El navegador de pruebas de este entorno bloqueó las URL locales.
- Revisión de QR reales antes de publicar (incluido QR visible del pase de Bernardo).

El proyecto se entrega como código fuente editable, no como un build `dist/` ya compilado.
