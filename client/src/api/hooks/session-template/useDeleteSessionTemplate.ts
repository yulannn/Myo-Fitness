import { useMutation, useQueryClient } from '@tanstack/react-query';
import sessionTemplateService from '../../services/sessionTemplateService';

export function useDeleteSessionTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: number) => sessionTemplateService.deleteTemplate(templateId),
        onSuccess: () => {
            // Invalider le cache du programme actif pour rafraîchir l'affichage
            queryClient.invalidateQueries({ queryKey: ['program', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['program', 'archived'] });
        },
    });
}

export default useDeleteSessionTemplate;
