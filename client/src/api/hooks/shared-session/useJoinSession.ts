import { useMutation, useQueryClient } from '@tanstack/react-query';
import SharedSessionService from '../../services/sharedSessionService';

export function useJoinSession() {
    const qc = useQueryClient();

    return useMutation<any, unknown, string>({
        mutationFn: (sessionId: string) => SharedSessionService.join(sessionId),
        onSuccess: () => {
            // Invalidate shared sessions list
            qc.invalidateQueries({ queryKey: ['sharedSessions'] });

            // Optionally navigate to the specific page or show success
            // For now, staying in chat might be better UX, or navigating to 'shared-sessions' logic
            // The user didn't specify navigation, just "rejoindre la session". 
            // Often joining means you want to see details, but maybe just joining is enough.
            // Let's just invalidate for now. If they want to see it, they can go there. 
            // Actually, maybe navigating to shared sessions page is good feedback?
            // "qu'ils puissent rejoindre la session stp pas le bouton rejoindre depuis directement dans la page séance partagée"
            // Let's stay in chat and show a toast/success state if possible, but we don't have a toast system visible here.
            // We'll rely on button state (if we can) or just the fact it worked.
        }
    });
}

export default useJoinSession;
