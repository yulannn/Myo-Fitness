import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, CalendarDaysIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TemplateCard } from '../template';
import { ProgramStatusModal } from '../modal/ProgramStatusModal';
import { DeleteProgramModal } from '../modal/DeleteProgramModal';
import { EditProgramModal } from '../modal/EditProgramModal';
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
      <div
        className={`
          group relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-[#18181b] to-[#121214]
          border transition-all duration-500
          ${isActive
            ? 'border-[#94fbdd]/20 shadow-2xl shadow-[#94fbdd]/10'
            : 'border-white/5'
          }
        `}
      >
        {/* Glow effect pour programmes actifs */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#94fbdd]/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        )}

        {/* Header */}
        <div
          onClick={isActive ? undefined : onToggleExpand}
          className={`relative p-6 ${!isActive ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title avec badge actif */}
              <div className="flex items-center gap-3">
                <h2 className={`text-lg font-bold truncate transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {program.name}
                </h2>
                {isActive && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#94fbdd]/20 text-[#94fbdd] border border-[#94fbdd]/30 animate-pulse">
                    Actif
                  </span>
                )}
              </div>

              {/* Metadata avec meilleur espacement */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span className="font-medium">{program.sessionTemplates?.length || 0} séance{(program.sessionTemplates?.length || 0) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>{program.createdAt ? new Date(program.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                </div>
              </div>
            </div>

            {/* Actions avec boutons modernes */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleEditClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                className="p-2.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 hover:scale-110 transition-all disabled:opacity-50 backdrop-blur-sm"
                title="Modifier"
              >
                <PencilSquareIcon className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={handleStatusClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                className="p-2.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 hover:scale-110 transition-all disabled:opacity-50 backdrop-blur-sm"
                title={isActive ? "Archiver" : "Désarchiver"}
              >
                {isUpdatingStatus ? (
                  <div className="h-4.5 w-4.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isActive ? (
                  <ArchiveBoxIcon className="h-4.5 w-4.5" />
                ) : (
                  <ArrowUturnLeftIcon className="h-4.5 w-4.5" />
                )}
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                className="p-2.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all disabled:opacity-50 backdrop-blur-sm"
                title="Supprimer"
              >
                {isDeleting ? (
                  <div className="h-4.5 w-4.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="h-4.5 w-4.5" />
                )}
              </button>

              {((program.sessionTemplates && program.sessionTemplates.length > 0) || (program.sessions && program.sessions.length > 0)) && !isActive && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                  className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all backdrop-blur-sm"
                  title={isExpanded ? 'Masquer les séances' : 'Voir les séances'}
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4.5 w-4.5 transition-transform" />
                  ) : (
                    <ChevronDownIcon className="h-4.5 w-4.5 transition-transform" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Session Templates - Programmes actifs: toujours visible */}
        {program.sessionTemplates && program.sessionTemplates.length > 0 && isActive && (
          <div className="border-t border-white/5 p-6 space-y-3 bg-black/30 backdrop-blur-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#94fbdd] rounded-full" />
              Séances
            </p>
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
          <div className="border-t border-white/5 p-6 space-y-3 bg-black/30 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-gray-600 rounded-full" />
              Séances
            </p>
            {program.sessionTemplates.map((template: any) => (
              <div
                key={template.id}
                className="p-4 bg-[#121214]/80 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-all"
              >
                <p className="text-sm font-semibold text-gray-300">{template.name}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                  {template.exercises?.length || 0} exercice{(template.exercises?.length || 0) > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {(!program.sessionTemplates || program.sessionTemplates.length === 0) && isActive && (
          <div className="border-t border-white/5 p-8 text-center bg-black/30 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3">
              <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Aucune séance</p>
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
    </>
  );
};
