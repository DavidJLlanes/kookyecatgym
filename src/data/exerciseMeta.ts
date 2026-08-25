// Metadatos ligeros (grupos musculares, equipamiento, colores) separados del
// catálogo de 873 ejercicios (data/exercises.ts, ~1.1MB) para que los
// componentes que solo necesitan esto no arrastren esa carga al bundle.
export const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen'] as const;
export const EQUIPMENT_TYPES = ['Barra', 'Mancuernas', 'Polea', 'Máquina', 'Peso Corporal'] as const;

export function getMuscleColor(group: string): string {
  switch (group) {
    case 'Pecho': return '#ef4444'; // Rojo
    case 'Espalda': return '#3b82f6'; // Azul
    case 'Piernas': return '#10b981'; // Verde
    case 'Hombros': return '#f59e0b'; // Ámbar
    case 'Brazos': return '#8b5cf6'; // Púrpura
    case 'Abdomen': return '#06b6d4'; // Cian
    default: return '#6b7280'; // Gris
  }
}
