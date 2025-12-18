import { useMutation } from "@tanstack/react-query";
import SessionService from "../../services/sessionService";
import { useQueryClient } from "@tanstack/react-query";
import { useBadgeToastStore } from "../../../stores/useBadgeToastStore";



export default function useUpdateCompletedSession() {
    const qc = useQueryClient();
    const { addBadgeToast } = useBadgeToastStore();

    return useMutation<any, unknown, number>({
        mutationFn: (sessionId: number) => SessionService.completedSession(sessionId),
        onSuccess: (data, sessionId) => {
            // Invalider les queries
            qc.invalidateQueries({ queryKey: ['program'] });
            qc.invalidateQueries({ queryKey: ['sessions'] });
            qc.invalidateQueries({ queryKey: ['sessions', 'all'] });
            qc.invalidateQueries({ queryKey: ['user', 'xp'] });
            qc.invalidateQueries({ queryKey: ['body-atlas'] }); // ✅ Rafraîchir le Body Atlas
            if (sessionId) qc.invalidateQueries({ queryKey: ['session', sessionId] });

            // Afficher les badges débloqués
            if (data?.unlockedBadges && data.unlockedBadges.length > 0) {
                // Déclencher les toasts avec un délai entre chaque
                data.unlockedBadges.forEach((badge: any, index: number) => {
                    setTimeout(() => {
                        addBadgeToast(badge);
                    }, index * 800); // Délai de 800ms entre chaque badge
                });
            }
        }
    });
}
