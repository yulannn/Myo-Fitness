export interface User {
  id: number;
  email: string;
  name: string;
  profilePictureUrl?: string | null;
  role?: 'USER' | 'COACH';
  friendCode?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CoachingRequest {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  uniqueCode: string;
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  profilePictureUrl?: string | null;
  relationshipId: number;
  activeProgram?: {
    name: string;
    startDate: string;
  };
  daysSinceLastSession?: number | null;
}

export interface FitnessProfile {
  id: number;
  age?: number;
  height?: number;
  weight?: number;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  trainingFrequency?: number;
  goals?: string[];
}
