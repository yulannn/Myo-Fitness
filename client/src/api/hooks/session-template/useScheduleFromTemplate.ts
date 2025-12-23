import { useMutation, useQueryClient } from '@tanstack/react-query';
import sessionTemplateService, { ScheduleSessionDto } from '../../services/sessionTemplateService';

export default function useScheduleFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, dto }: { templateId: number; dto: ScheduleSessionDto }) =>
      sessionTemplateService.scheduleFromTemplate(templateId, dto),
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['programs', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
