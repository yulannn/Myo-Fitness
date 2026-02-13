import { apiRequest } from './client.js';

export const coachingApi = {
  /**
   * Récupérer la liste des clients liés au coach
   * @returns {Promise<Array>}
   */
  getClients: () => apiRequest('/coaching/clients'),

  /**
   * Rompre une relation de coaching
   * @param {number} relationshipId 
   */
  terminateRelationship: (relationshipId) => apiRequest(`/coaching/relationship/${relationshipId}`, 'DELETE'),
};

export default coachingApi;
