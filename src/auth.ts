// Autenticación multiusuario. La contraseña nunca sale del navegador en
// texto plano: se hashea con SHA-256 antes de enviarse; el servidor aplica
// además su propio hash (bcrypt) sobre ese valor antes de guardarlo.
// Este módulo solo gestiona la sesión guardada localmente (token + usuario);
// las llamadas de red (login/registro/logout) viven en src/api/client.ts.

const TOKEN_KEY = 'gym_auth_token';
const USER_KEY = 'gym_auth_user';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  return sha256(password);
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getStoredUser();
}
