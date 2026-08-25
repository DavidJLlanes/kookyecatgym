// KookyeCatGym es un producto pensado para el mercado español: los números decimales
// (pesos de mancuernas como "7,5 kg", 1RM estimado, etc.) se muestran y se
// escriben con coma, no con punto.

// Formatea un número para mostrarlo con coma decimal y punto de millar (es-ES).
// useGrouping se pasa explícito: en algunos motores, dejarlo en su valor por
// defecto ("auto") no agrupa los miles cuando solo se especifica
// maximumFractionDigits, así que sin esto el punto de millar podía faltar.
export function formatEsNumber(value: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('es-ES', { maximumFractionDigits: maxFractionDigits, useGrouping: true });
}

// Convierte texto introducido por el usuario (que puede escribir el
// separador decimal como coma o como punto) a un número JS válido. Si el
// texto contiene una coma, se asume que es el separador decimal y se quitan
// los puntos (de millar) antes de normalizar — así se tolera texto ya
// formateado con agrupación (ej. "1.234,5") sin romper el caso normal de un
// solo punto como separador decimal (ej. "7.5").
export function parseEsNumber(text: string): number {
  const hasComma = text.includes(',');
  const normalized = hasComma ? text.replace(/\./g, '').replace(',', '.') : text;
  const value = parseFloat(normalized.trim());
  return Number.isFinite(value) ? value : 0;
}

// Formatea un peso en kg de forma compacta: a partir de 1000 usa sufijo "K"
// (2.079.100 -> "2.079,1K kg"), por debajo se muestra tal cual (950 -> "950 kg").
export function formatEsCompactKg(value: number): string {
  if (!Number.isFinite(value)) return '0 kg';
  if (Math.abs(value) >= 1000) {
    return `${formatEsNumber(value / 1000, 1)}K kg`;
  }
  return `${formatEsNumber(value)} kg`;
}
