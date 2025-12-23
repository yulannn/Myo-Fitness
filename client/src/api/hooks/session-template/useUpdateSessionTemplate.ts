import { useMutation, useQueryClient } from '@tanstack/react-query';
import sessionTemplateService, { UpdateSessionTemplateDto } from '../../services/sessionTemplateService';

export default function useUpdateSessionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, dto }: { templateId: number; dto: UpdateSessionTemplateDto }) =>
      sessionTemplateService.updateTemplate(templateId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
