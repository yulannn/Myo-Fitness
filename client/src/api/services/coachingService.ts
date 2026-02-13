import api from '../apiClient';

export interface CoachingRequest {
  id: number;
  coachId: number;
  clientId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  coach?: {
    id: number;
    name: string;
    profilePictureUrl?: string;
  };
}

export interface CoachClient {
  id: number;
  relationshipId: number;
  name: string;
  email: string;
  profilePictureUrl?: string;
  goals: string[];
  lastSessionDate?: string;
  lastSessionName?: string;
}

export const coachingService = {
  /**
   * Envoyer une demande de coaching via uniqueCode
   */
  async requestCoaching(uniqueCode: string) {
    return api.post('/coaching/request', { uniqueCode });
  },

  /**
   * Répondre à une demande (Accepter/Refuser)
   */
  async respondToRequest(requestId: number, status: 'ACCEPTED' | 'REJECTED') {
    return api.patch('/coaching/respond', { requestId, status });
  },

  /**
   * Récupérer les clients du coach
   */
  async getCoachClients(): Promise<CoachClient[]> {
    const res = await api.get('/coaching/clients');
    return res.data;
  },

  /**
   * Récupérer les demandes en attente pour un client
   */
  async getPendingRequests(): Promise<CoachingRequest[]> {
    const res = await api.get('/coaching/pending');
    return res.data;
  }
};
