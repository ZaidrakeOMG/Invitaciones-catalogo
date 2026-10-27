/** DATOS DE MARCA — cambia este archivo para personalizar todo el sitio. */
export const site = {
  brand: 'CAZAMI',
  brandExtended: 'CAZAMI STUDIO',
  descriptor: 'INVITACIONES DE AUTOR',
  title: 'CAZAMI — Invitaciones digitales de autor',
  description: 'CAZAMI Studio: invitaciones web personalizadas, pases digitales, control de acceso y tarjetas NFC. Conoce las demostraciones y solicita tu cotización.',
  instagram: '', // Se deja vacío porque CAZAMI proporcionó TikTok, no Instagram.
  tiktok: 'https://www.tiktok.com/@cazami0225',
  facebook: 'https://www.facebook.com/share/19jqVZiRhn/?mibextid=wwXIfr',
  whatsapp: '528717977576', // México +52 y número 871 797 7576 (formato wa.me).
  whatsappDisplay: '871 797 7576',
  pricing: 'cotizacion', // Precios por consulta, nunca cantidades inventadas.
  exampleUrl: 'https://zyc-invitacion.netlify.app/', // Invitación real compartida por CAZAMI.
  email: '',
} as const;

export function contactHref(message = 'Hola, CAZAMI. Me gustaría solicitar una cotización para una invitación digital personalizada. ¿Me pueden dar información?') {
  return site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
    : site.facebook;
}
