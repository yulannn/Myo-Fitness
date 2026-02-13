import { useState, useEffect } from 'react';
import { coachingService } from '../../services/coachingService';
import type { CoachingRequest } from '../../services/coachingService';

export const useCoachingRequests = () => {
  const [requests, setRequests] = useState<CoachingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await coachingService.getPendingRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching coaching requests:', err);
      setError('Impossible de charger les demandes de coaching.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respond = async (requestId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await coachingService.respondToRequest(requestId, status);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      return true;
    } catch (err) {
      console.error('Error responding to coaching request:', err);
      return false;
    }
  };

  return {
    requests,
    loading,
    error,
    refresh: fetchRequests,
    respond
  };
};
