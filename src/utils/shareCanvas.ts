// Utilidades compartidas para generar las tarjetas compartibles (canvas):
// la de progreso general y la del resumen diario. Centraliza el dibujo de
// primitivas, la carga de imágenes (logo + foto del usuario) y el descargar/
// compartir, para que ambas tarjetas se vean coherentes.

// Rectángulo con esquinas redondeadas (no todos los navegadores soportan
// roundRect con radios por esquina, así que se hace a mano).
export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Carga una imagen y resuelve cuando está lista. NUNCA rechaza: si falla
// (offline, archivo ausente…) resuelve a null para que la tarjeta se genere
// igualmente sin esa imagen.
export function loadImage(src: string, anon = false): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    // Solo para imágenes de otro origen (ej. foto de un ejercicio personalizado
    // en un servidor externo): pide CORS para no "manchar" el canvas. Para las
    // imágenes locales (mismo origen) no hace falta y se evita cualquier lío de
    // caché.
    if (anon) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Dibuja una imagen recortada en un círculo (avatar), con "cover" para que no
// se deforme sea cual sea la relación de aspecto de la foto original.
export function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number
) {
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, sx, sy, side, side, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

// Descarga un dataURL como archivo.
export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;
}

// Detecta iOS/iPadOS. Necesario porque Safari en iOS IGNORA el atributo
// download de los enlaces, así que la descarga clásica no guarda nada.
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iPhoneEtc = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ se hace pasar por Mac; se distingue por el soporte táctil.
  const iPadOS =
    ua.includes('Mac') &&
    typeof document !== 'undefined' &&
    ('ontouchend' in document || (navigator.maxTouchPoints ?? 0) > 1);
  return iPhoneEtc || iPadOS;
}

// "Descargar" fiable en cualquier plataforma. En iOS el <a download> no
// funciona, así que se abre la hoja de compartir del sistema, cuya opción
// "Guardar imagen" guarda la tarjeta en Fotos. En el resto (escritorio,
// Android) se descarga el archivo directamente.
export function saveImage(canvas: HTMLCanvasElement, filename: string, title: string, dataUrl: string) {
  if (isIOS()) {
    shareCanvas(canvas, filename, title, dataUrl);
  } else {
    downloadDataUrl(dataUrl, filename);
  }
}

// Comparte el contenido del canvas como imagen usando la Web Share API; si no
// se puede (navegador sin soporte, usuario canceló…) cae a descargar.
export function shareCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  title: string,
  fallbackDataUrl: string
) {
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title });
      } else if (fallbackDataUrl) {
        downloadDataUrl(fallbackDataUrl, filename);
      }
    } catch {
      // El usuario canceló el share sheet u ocurrió un error: no hace falta avisar.
    }
  }, 'image/png');
}

// Fuente base reutilizada (una sola familia para que todo case).
export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// Recorta un texto con puntos suspensivos si excede maxWidth (para nombres de
// rutina largos, etc.).
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + '…';
}
