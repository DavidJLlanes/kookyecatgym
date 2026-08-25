import { WorkoutLog } from '../types';
import { formatEsNumber } from './number';

// Topes absolutos: por encima de esto es casi seguro un error de tecleo
// (p. ej. escribir "89" en vez de "8" repeticiones, o colar un dígito de más
// en el peso).
const ABSOLUTE_MAX_WEIGHT = 500; // kg
const ABSOLUTE_MAX_REPS = 100;

// Márgenes relativos al histórico del propio ejercicio. Se exige además una
// diferencia mínima absoluta para no dar falsos avisos con cargas pequeñas
// (subir de 2 kg a 6 kg triplica, pero es perfectamente normal).
const WEIGHT_FACTOR = 2.5;
const WEIGHT_MIN_DELTA = 20; // kg
const REPS_FACTOR = 3;
const REPS_MIN_DELTA = 15;

export interface SetAnomaly {
  message: string;
}

// Detecta un peso o un número de repeticiones anormalmente altos para un
// ejercicio, comparando con lo que el usuario ha hecho históricamente en ese
// mismo ejercicio. Devuelve null si el valor es plausible.
export function detectSetAnomaly(
  exerciseId: string,
  weight: number,
  reps: number,
  logs: WorkoutLog[]
): SetAnomaly | null {
  let maxWeight = 0;
  let maxReps = 0;
  for (const log of logs) {
    for (const we of log.exercises) {
      if (we.exerciseId !== exerciseId) continue;
      for (const s of we.sets) {
        if (!s.completed) continue;
        if (s.weight > maxWeight) maxWeight = s.weight;
        if (s.reps > maxReps) maxReps = s.reps;
      }
    }
  }

  if (weight > ABSOLUTE_MAX_WEIGHT) {
    return {
      message: `Has anotado ${formatEsNumber(weight)} kg, un peso fuera de lo habitual. ¿Seguro que es correcto?`,
    };
  }

  if (reps > ABSOLUTE_MAX_REPS) {
    return {
      message: `Has anotado ${reps} repeticiones, una cifra fuera de lo habitual. ¿Seguro que es correcta?`,
    };
  }

  if (maxWeight > 0 && weight > maxWeight * WEIGHT_FACTOR && weight - maxWeight >= WEIGHT_MIN_DELTA) {
    return {
      message: `Has anotado ${formatEsNumber(weight)} kg, muy por encima de tu máximo en este ejercicio (${formatEsNumber(
        maxWeight
      )} kg). ¿Seguro que es correcto?`,
    };
  }

  if (maxReps > 0 && reps > maxReps * REPS_FACTOR && reps - maxReps >= REPS_MIN_DELTA) {
    return {
      message: `Has anotado ${reps} repeticiones, muy por encima de tu máximo en este ejercicio (${maxReps}). ¿Seguro que es correcto?`,
    };
  }

  return null;
}
