// ─────────────────────────────────────────────────────────────
// Coaching API – Coach Dashboard endpoints
// ─────────────────────────────────────────────────────────────

import { apiRequest } from './client.js';

const coachingApi = {
  /** Liste enrichie des clients (stats 30j, programme actif, etc.) */
  getClients: () => apiRequest('/coaching/clients'),

  /** Envoyer une demande de coaching via uniqueCode */
  createRequest: (uniqueCode) =>
    apiRequest('/coaching/request', {
      method: 'POST',
      body: { uniqueCode },
    }),

  /** Répondre à une demande (Accepter/Refuser) - Client side */
  respondToRequest: (requestId, status) =>
    apiRequest('/coaching/respond', {
      method: 'PATCH',
      body: { requestId, status },
    }),

  /** Détail complet d'un client spécifique */
  getClientDetail: (clientId) => apiRequest(`/coaching/clients/${clientId}`),

  /** Détail d'une séance spécifique d'un client */
  getClientSessionDetail: (clientId, sessionId) =>
    apiRequest(`/coaching/clients/${clientId}/sessions/${sessionId}`),

  /** Rompre une relation de coaching */
  terminateRelationship: (relationshipId) =>
    apiRequest(`/coaching/relationship/${relationshipId}`, { method: 'DELETE' }),

  /** Récupérer son coach actuel (Client side) */
  getMyCoach: () => apiRequest('/coaching/my-coach'),

  /** Récupérer les demandes en attente (Client side) */
  getPendingRequests: () => apiRequest('/coaching/pending'),
};

export default coachingApi;
