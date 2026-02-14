import api from '../apiClient';
import { Client } from '../../types';

export const CoachingService = {
  /** Liste enrichie des clients (stats 30j, programme actif, etc.) */
  getClients: async (): Promise<Client[]> => {
    const { data } = await api.get<Client[]>('/coaching/clients');
    return data;
  },

  /** Envoyer une demande de coaching via uniqueCode */
  createRequest: async (uniqueCode: string): Promise<any> => {
    const { data } = await api.post('/coaching/request', { uniqueCode });
    return data;
  },

  /** Répondre à une demande (Accepter/Refuser) - Client side */
  respondToRequest: async (requestId: number, status: string): Promise<any> => {
    const { data } = await api.patch('/coaching/respond', { requestId, status });
    return data;
  },

  /** Détail complet d'un client spécifique */
  getClientDetail: async (clientId: number): Promise<any> => {
    const { data } = await api.get(`/coaching/clients/${clientId}`);
    return data;
  },

  /** Détail d'une séance spécifique d'un client */
  getClientSessionDetail: async (clientId: number, sessionId: number): Promise<any> => {
    const { data } = await api.get(`/coaching/clients/${clientId}/sessions/${sessionId}`);
    return data;
  },

  /** Rompre une relation de coaching */
  terminateRelationship: async (relationshipId: number): Promise<any> => {
    const { data } = await api.delete(`/coaching/relationship/${relationshipId}`);
    return data;
  },

  /** Récupérer son coach actuel (Client side) */
  getMyCoach: async (): Promise<any> => {
    const { data } = await api.get('/coaching/my-coach');
    return data;
  },

  /** Récupérer les demandes en attente (Client side) */
  getPendingRequests: async (): Promise<any[]> => {
    const { data } = await api.get<any[]>('/coaching/pending');
    return data;
  },
};

export default CoachingService;
