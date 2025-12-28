import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SessionTemplateService from '../../services/sessionTemplateService';
import { usePerformanceStore } from '../../../store/usePerformanceStore';
import SessionLoadingOverlay from '../../../components/ui/SessionLoadingOverlay';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

interface StartFromTemplateParams {
  templateId: number;
}

// 🔧 Stocker la référence du root pour éviter les appels multiples à createRoot()
let overlayRoot: Root | null = null;

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

  // 🔧 FIX: Render loading overlay in a portal - réutiliser le root existant
  if (typeof window !== 'undefined') {
    let container = document.getElementById('session-loading-overlay-root');

    if (!container) {
      container = document.createElement('div');
      container.id = 'session-loading-overlay-root';
      document.body.appendChild(container);
    }

    // Créer le root UNE SEULE FOIS
    if (!overlayRoot) {
      overlayRoot = createRoot(container);
    }

    // Utiliser render() sur le root existant
    overlayRoot.render(createElement(SessionLoadingOverlay, { isLoading: mutation.isPending }));
  }

  return mutation;
}

export default useStartFromTemplate;
