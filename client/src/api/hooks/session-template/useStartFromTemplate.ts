import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SessionTemplateService from '../../services/sessionTemplateService';
import { usePerformanceStore } from '../../../store/usePerformanceStore';
import SessionLoadingOverlay from '../../../components/ui/SessionLoadingOverlay';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

interface StartFromTemplateParams {
  templateId: number;
}

export function useStartFromTemplate() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setSessionId, setActiveSession, setStartTime } = usePerformanceStore();

  const mutation = useMutation<any, unknown, StartFromTemplateParams>({
    mutationFn: async ({ templateId }: StartFromTemplateParams) => {
      // ⏱️ Durée minimale de 2 secondes pour que le loader soit visible
      const startTime = Date.now();
      const result = await SessionTemplateService.startFromTemplate(templateId);
      const elapsed = Date.now() - startTime;
      const minDuration = 2000; // 2 secondes minimum

      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
      }

      return result;
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

  // Render loading overlay in a portal
  if (typeof window !== 'undefined') {
    let overlayRoot = document.getElementById('session-loading-overlay-root');
    if (!overlayRoot) {
      overlayRoot = document.createElement('div');
      overlayRoot.id = 'session-loading-overlay-root';
      document.body.appendChild(overlayRoot);
    }

    const root = createRoot(overlayRoot);
    root.render(createElement(SessionLoadingOverlay, { isLoading: mutation.isPending }));
  }

  return mutation;
}

export default useStartFromTemplate;
