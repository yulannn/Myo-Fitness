import { useState } from 'react';
import { PlayIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import useStartFromTemplate from '../../../api/hooks/session-template/useStartFromTemplate';
import { EditTemplateModal } from '../modal/EditTemplateModal';

interface TemplateCardProps {
  template: any;
  programId: number;
  availableExercises?: ExerciceMinimal[];
}

export const TemplateCard = ({ template, programId, availableExercises = [] }: TemplateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { mutate: startTemplate, isPending: isStarting } = useStartFromTemplate();

  const handleStart = () => {
    startTemplate({ templateId: template.id });
  };

  return (
    <>
      <div className="bg-[#252527] rounded-xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-1">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-xs text-gray-500 line-clamp-1">
                  {template.description}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                {template.exercises?.length || 0} exercice{(template.exercises?.length || 0) > 1 ? 's' : ''}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Modifier le template"
              >
                <PencilSquareIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handleStart}
                disabled={isStarting}
                className="flex items-center gap-2 px-4 py-2 bg-[#94fbdd] text-[#121214] font-bold rounded-lg hover:bg-[#7de0c4] transition-colors disabled:opacity-50 shadow-lg shadow-[#94fbdd]/20"
                title="Démarrer cette séance"
              >
                <PlayIcon className="h-4 w-4" />
                <span className="text-sm">{isStarting ? 'Démarrage...' : 'Démarrer'}</span>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title={isExpanded ? 'Masquer' : 'Afficher les détails'}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Exercices détails (collapsible) */}
        {isExpanded && template.exercises && template.exercises.length > 0 && (
          <div className="border-t border-[#94fbdd]/10 p-4 bg-black/20 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Exercices du template
            </p>
            {template.exercises.map((ex: any, idx: number) => (
              <div
                key={ex.id || idx}
                className="flex items-center justify-between p-3 bg-[#121214] rounded-lg border border-[#94fbdd]/5"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {ex.exercise?.name || 'Exercice'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ex.sets} séries × {ex.reps} reps
                    {ex.weight ? ` @ ${ex.weight}kg` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <EditTemplateModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          template={template}
          availableExercises={availableExercises}
        />
      )}
    </>
  );
};
