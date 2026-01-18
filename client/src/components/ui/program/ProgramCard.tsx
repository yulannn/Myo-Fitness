import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, CalendarDaysIcon, PencilSquareIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/outline';
import { TemplateCard } from '../template';
import { ProgramStatusModal } from '../modal/ProgramStatusModal';
import { DeleteProgramModal } from '../modal/DeleteProgramModal';
import { EditProgramModal } from '../modal/EditProgramModal';
import { ShareProgramModal } from '../modal/ShareProgramModal';
import { EditTemplateModal } from '../modal/EditTemplateModal';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import useUpdateProgramStatus from '../../../api/hooks/program/useUpdateProgramStatus';
import useDeleteProgram from '../../../api/hooks/program/useDeleteProgram';
import useUpdateProgram from '../../../api/hooks/program/useUpdateProgram';

interface ProgramCardProps {
  program: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  exercices: ExerciceMinimal[];
  activeProgram?: any;
}

export const ProgramCard = ({ program, isExpanded, onToggleExpand, exercices, activeProgram }: ProgramCardProps) => {
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProgramStatus();
  const { mutate: deleteProgram, isPending: isDeleting } = useDeleteProgram();
  const { mutate: updateProgram, isPending: isUpdating } = useUpdateProgram();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);

  const isActive = program.status === 'ACTIVE';

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    const newStatus = program.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    updateStatus({ programId: program.id, status: newStatus }, {
      onSuccess: () => setIsStatusModalOpen(false)
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteProgram(program.id, {
      onSuccess: () => setIsDeleteModalOpen(false)
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = (data: { name: string }) => {
    updateProgram({ programId: program.id, payload: data }, {
      onSuccess: () => setIsEditModalOpen(false)
    });
  };



  return (
    <>
      <div className="border-b border-white/5 pb-8 mb-8">
        {/* Header */}
        <div
          onClick={isActive ? undefined : onToggleExpand}
          className={`${!isActive ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              {/* Title with status */}
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {program.name}
                </h2>
                {isActive && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#94fbdd]">
                    Actif
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  <span>{program.sessionTemplates?.length || 0} séance{(program.sessionTemplates?.length || 0) > 1 ? 's' : ''}</span>
                </div>
                <span>•</span>
                <span>{program.createdAt ? new Date(program.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }}
                className="p-2 text-gray-500 hover:text-[#94fbdd] transition-colors"
                title="Partager"
              >
                <ShareIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handleEditClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                aria-label={`Modifier le programme ${program.name}`}
                className="p-2 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                title="Modifier"
              >
                <PencilSquareIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handleStatusClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                aria-label={isActive ? `Archiver le programme ${program.name}` : `Désarchiver le programme ${program.name}`}
                className="p-2 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                title={isActive ? "Archiver" : "Désarchiver"}
              >
                {isUpdatingStatus ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isActive ? (
                  <ArchiveBoxIcon className="h-4 w-4" />
                ) : (
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                aria-label={`Supprimer le programme ${program.name}`}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                title="Supprimer"
              >
                {isDeleting ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </button>

              {((program.sessionTemplates && program.sessionTemplates.length > 0) || (program.sessions && program.sessions.length > 0)) && !isActive && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title={isExpanded ? 'Masquer les séances' : 'Voir les séances'}
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Session Templates - Programmes actifs: toujours visible */}
        {program.sessionTemplates && program.sessionTemplates.length > 0 && isActive && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Séances
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateTemplateModalOpen(true); // Changed to open CreateTemplateModal
                }}
                className="text-xs text-[#94fbdd] hover:text-[#7de0c4] font-semibold flex items-center gap-1 transition-colors"
                title="Ajouter une séance"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter
              </button>
            </div>
            {program.sessionTemplates.map((template: any) => {
              const scheduledInstance = program.sessions?.find(
                (session: any) => session.sessionTemplateId === template.id && !session.completed
              );

              return (
                <TemplateCard
                  key={template.id}
                  template={{
                    ...template,
                    instances: scheduledInstance ? [scheduledInstance] : []
                  }}
                  programId={program.id}
                  availableExercises={exercices}
                />
              );
            })}
          </div>
        )}

        {/* Session Templates - Programmes archivés: visible si expanded, read-only */}
        {program.sessionTemplates && program.sessionTemplates.length > 0 && !isActive && isExpanded && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Séances
            </p>
            {program.sessionTemplates.map((template: any) => (
              <div
                key={template.id}
                className="py-2 border-b border-white/5"
              >
                <p className="text-sm font-medium text-gray-300">{template.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {template.exercises?.length || 0} exercice{(template.exercises?.length || 0) > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {(!program.sessionTemplates || program.sessionTemplates.length === 0) && isActive && (
          <div className="mt-6 py-8 text-center border-t border-white/5">
            <CalendarDaysIcon className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">Aucune séance</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateTemplateModalOpen(true);
              }}
              className="text-sm text-[#94fbdd] hover:text-[#7de0c4] font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une séance
            </button>
          </div>
        )}
      </div>

      <ProgramStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        program={program}
        activeProgram={activeProgram}
        isPending={isUpdatingStatus}
      />

      <DeleteProgramModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        programName={program.name}
        isPending={isDeleting}
      />

      <EditProgramModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleConfirmEdit}
        program={program}
        isPending={isUpdating}
      />

      <ShareProgramModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        program={program}
      />

      {/* Modal pour créer une nouvelle séance */}
      {isCreateTemplateModalOpen && (
        <EditTemplateModal
          isOpen={isCreateTemplateModalOpen}
          onClose={() => setIsCreateTemplateModalOpen(false)}
          template={{
            programId: program.id,
            name: '',
            description: '',
            exercises: []
          }}
          availableExercises={exercices}
        />
      )}
    </>

  );
};
