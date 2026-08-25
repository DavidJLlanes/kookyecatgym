/**
 * Cliente API para comunicarse con el backend PHP (URL configurable con VITE_API_BASE)
 */
import { getAuthToken, hashPassword, setSession, clearSession, AuthUser } from '../auth';
import type { Exercise, Routine, WorkoutLog } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: any;
}

async function apiCall<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const method = options.method || 'GET';
  const url = `${API_BASE}/${endpoint}`;

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Gym-Auth': getAuthToken() ?? '',
    },
  };

  if (options.body) {
    init.body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    console.error(`API call failed: ${endpoint}`, err);
    throw new Error('No se pudo conectar con el servidor');
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data && typeof data.error === 'string' ? data.error : `Error de red (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

// --- AUTENTICACIÓN ---
export async function register(username: string, email: string, password: string): Promise<AuthUser> {
  const hashed = await hashPassword(password);
  const res = await apiCall<{ token: string; user: AuthUser }>('auth/register', {
    method: 'POST',
    body: { username, email, password: hashed },
  });
  setSession(res.token, res.user);
  return res.user;
}

export async function login(identifier: string, password: string): Promise<AuthUser> {
  const hashed = await hashPassword(password);
  const res = await apiCall<{ token: string; user: AuthUser }>('auth/login', {
    method: 'POST',
    body: { identifier, password: hashed },
  });
  setSession(res.token, res.user);
  return res.user;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await apiCall<{ user: AuthUser }>('auth/me');
  return res.user;
}

export async function logout(): Promise<void> {
  try {
    await apiCall('auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

// --- ADMINISTRACIÓN DE USUARIOS (requiere rol admin) ---
export interface AdminUserRow extends AuthUser {
  created_at: string;
}

export async function getUsers(): Promise<AdminUserRow[]> {
  return apiCall<AdminUserRow[]>('users');
}

export async function adminCreateUser(
  username: string,
  email: string,
  password: string,
  role: 'user' | 'admin'
): Promise<AdminUserRow> {
  const hashed = await hashPassword(password);
  return apiCall<AdminUserRow>('users', {
    method: 'POST',
    body: { username, email, password: hashed, role },
  });
}

export async function adminDeleteUser(id: string) {
  return apiCall('users', { method: 'DELETE', body: { id } });
}

export async function adminSetUserRole(id: string, role: 'user' | 'admin') {
  return apiCall('users/role', { method: 'POST', body: { id, role } });
}

// --- ROUTINES ---
export async function getRoutines(): Promise<Routine[]> {
  return apiCall<Routine[]>('routines');
}

export async function saveRoutine(routine: Routine) {
  return apiCall('routines', { method: 'POST', body: routine });
}

export async function saveRoutines(routines: Routine[]) {
  for (const routine of routines) {
    await saveRoutine(routine);
  }
}

export async function deleteRoutine(id: string) {
  return apiCall('routines', { method: 'DELETE', body: { id } });
}

// --- LOGS ---
export async function getLogs(): Promise<WorkoutLog[]> {
  return apiCall<WorkoutLog[]>('logs');
}

export async function saveLog(log: WorkoutLog) {
  return apiCall('logs', { method: 'POST', body: log });
}

export async function saveLogs(logs: WorkoutLog[]) {
  for (const log of logs) {
    await saveLog(log);
  }
}

export async function deleteLog(id: string) {
  return apiCall('logs', { method: 'DELETE', body: { id } });
}

// --- EXERCISES ---
export async function getExercises(): Promise<Exercise[]> {
  return apiCall<Exercise[]>('exercises');
}

export async function saveExercises(exercises: Exercise[]) {
  // El endpoint acepta un array (bulk)
  return apiCall('exercises', { method: 'POST', body: exercises });
}

// --- ACTIVE WORKOUT ---
export async function getActiveWorkout(): Promise<any> {
  return apiCall<any>('active-workout');
}

export async function saveActiveWorkout(workout: any) {
  if (!workout) {
    return deleteActiveWorkout();
  }
  return apiCall('active-workout', { method: 'POST', body: workout });
}

export async function deleteActiveWorkout() {
  return apiCall('active-workout', { method: 'DELETE' });
}
