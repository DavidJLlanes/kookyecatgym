// Deriva la ruta del fotograma estático (JPG) de un GIF de ejercicio.
// Se usa en listas/rejillas (rendimiento) en vez del GIF animado, que se
// reserva para el lightbox y el modal de detalle de un ejercicio concreto.
export function getStaticThumbUrl(imageUrl: string): string {
  if (!imageUrl.toLowerCase().endsWith('.gif')) return imageUrl;
  return imageUrl.replace(/\.gif$/i, '-poster.jpg');
}
