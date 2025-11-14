const API_BASE_URL = 'http://localhost:3000/api/v1';

export interface FitnessProfilePayload {
    age: number;
    height: number;
    weight: number;
    trainingFrequency: number;
  
    experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    goals: ('MUSCLE_GAIN' | 'WEIGHT_LOSS')[];
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    bodyWeight: boolean;
  }

export interface FitnessProfile extends FitnessProfilePayload {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchJson<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Accept', 'application/json');
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || 'Erreur API');
  }

  return data as T;
}

export async function getFitnessProfiles(accessToken: string): Promise<FitnessProfile[]> {
  return fetchJson<FitnessProfile[]>('/fitness-profile', { method: 'GET' }, accessToken);
}

export async function createFitnessProfile(
  payload: FitnessProfilePayload,
  accessToken: string
): Promise<FitnessProfile> {
  return fetchJson<FitnessProfile>('/fitness-profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function deleteFitnessProfile(
    id: number,
    accessToken: string
  ): Promise<void> {
    return fetchJson<void>(`/fitness-profile/${id}`, {
      method: 'DELETE',
    }, accessToken);
  }