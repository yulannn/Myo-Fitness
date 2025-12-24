import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SessionTemplateService from '../../services/sessionTemplateService';
import { usePerformanceStore } from '../../../store/usePerformanceStore';

interface StartFromTemplateParams {
  templateId: number;
}

export function useStartFromTemplate() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setSessionId, setActiveSession, setStartTime } = usePerformanceStore();

  return useMutation<any, unknown, StartFromTemplateParams>({
    mutationFn: async ({ templateId }: StartFromTemplateParams) => {
      return SessionTemplateService.startFromTemplate(templateId);
    },
    onSuccess: (session) => {
      // Invalider le cache des programmes
      queryClient.invalidateQueries({ queryKey: ['program'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });

      // 🚀 NOUVEAU: Invalider stats car totalSessions et upcomingSessions changent
      queryClient.invalidateQueries({ queryKey: ['sessions', 'stats'] });

      // Démarrer la session active
      setSessionId(session.id);
      setActiveSession(session);
      setStartTime(Date.now());

      // Naviguer vers la page de session active
      navigate('/active-session');
    },
    onError: (error) => {
      console.error('Erreur lors du démarrage de la session:', error);
      alert('Impossible de démarrer la session. Veuillez réessayer.');
    },
  });
}

export default useStartFromTemplate;
