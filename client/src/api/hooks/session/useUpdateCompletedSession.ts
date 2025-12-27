import { useMutation } from "@tanstack/react-query";
import SessionService from "../../services/sessionService";
import { useQueryClient } from "@tanstack/react-query";
import { useBadgeToastStore } from "../../../stores/useBadgeToastStore";
import { usePerformanceStore } from "../../../store/usePerformanceStore";



export default function useUpdateCompletedSession() {
    const qc = useQueryClient();
    const { addBadgeToast } = useBadgeToastStore();
    const { setActiveSession } = usePerformanceStore();

    return useMutation<any, unknown, number>({
        mutationFn: (sessionId: number) => SessionService.completedSession(sessionId),
        onSuccess: (data, sessionId) => {
            // 🔥 Mettre à jour activeSession avec le summary (contient caloriesBurned)
            if (data) {
                setActiveSession(data);
            }

            // Invalider les queries
            qc.invalidateQueries({ queryKey: ['program'] });
            qc.invalidateQueries({ queryKey: ['sessions'] });
            qc.invalidateQueries({ queryKey: ['sessions', 'all'] });

            // 🚀 NOUVEAUX: Invalider les stats, records et streak
            qc.invalidateQueries({ queryKey: ['sessions', 'stats'] });
            qc.invalidateQueries({ queryKey: ['sessions', 'records'] });
            qc.invalidateQueries({ queryKey: ['sessions', 'streak'] });

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
