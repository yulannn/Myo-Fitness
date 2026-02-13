import { apiRequest } from './client.js';

export const coachingApi = {
  /**
   * Récupérer la liste des clients liés au coach
   * @returns {Promise<Array>}
   */
  getClients: () => apiRequest('/coaching/clients'),
};

export default coachingApi;
