import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, CalendarDaysIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SessionCard } from '../session';
import { ProgramStatusModal } from '../modal/ProgramStatusModal';
import { DeleteProgramModal } from '../modal/DeleteProgramModal';
import { EditProgramModal } from '../modal/EditProgramModal';
import useUpdateProgramStatus from '../../../api/hooks/program/useUpdateProgramStatus';
import useDeleteProgram from '../../../api/hooks/program/useDeleteProgram';
import useUpdateProgram from '../../../api/hooks/program/useUpdateProgram';

interface ProgramCardProps {
  program: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  exercices: any[];
  sortSessions: (sessions: any[]) => any[];
  activeProgram?: any;
}

export const ProgramCard = ({ program, isExpanded, onToggleExpand, exercices, sortSessions, activeProgram }: ProgramCardProps) => {
  const hasSession = program.sessions && program.sessions.length > 0;
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProgramStatus();
  const { mutate: deleteProgram, isPending: isDeleting } = useDeleteProgram();
  const { mutate: updateProgram, isPending: isUpdating } = useUpdateProgram();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isActive = program.status === 'ACTIVE';
  const showSessions = hasSession && (isActive || isExpanded);

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

  const handleConfirmEdit = (data: { name: string; description: string }) => {
    updateProgram({ programId: program.id, payload: data }, {
      onSuccess: () => setIsEditModalOpen(false)
    });
  };

  return (
    <>
      <div
        className={`
          relative overflow-hidden rounded-lg
          bg-[#18181b] border transition-all
          ${isActive
            ? 'border-white/10 hover:border-white/20'
            : 'border-white/5 hover:border-white/10'
          }
        `}
      >
        {/* Header */}
        <div
          onClick={isActive ? undefined : onToggleExpand}
          className={`relative p-4 ${!isActive ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title */}
              <h2 className={`text-base font-semibold truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {program.name}
              </h2>

              {/* Description */}
              {program.description && (
                <p className="text-sm text-gray-500 line-clamp-1">
                  {program.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  <span>{program.sessions?.length || 0} séance{(program.sessions?.length || 0) > 1 ? 's' : ''}</span>
                </div>
                <span>•</span>
                <span>{program.createdAt ? new Date(program.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                title="Modifier"
              >
                <PencilSquareIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handleStatusClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                title={isActive ? "Archiver" : "Désarchiver"}
              >
                {isUpdatingStatus ? (
                  <div className="h-4 w-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : isActive ? (
                  <ArchiveBoxIcon className="h-4 w-4" />
                ) : (
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isUpdatingStatus || isDeleting || isUpdating}
                className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                title="Supprimer"
              >
                {isDeleting ? (
                  <div className="h-4 w-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </button>

              {hasSession && !isActive && (
                <div className="p-1.5 text-gray-500">
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sessions */}
        {showSessions && (
          <div className="border-t border-white/5 p-4 space-y-3 bg-black/20">
            {sortSessions(program.sessions).map((session: any) => (
              <SessionCard
                key={session.id ?? `session-${program.id}-${session.date}`}
                session={session}
                availableExercises={exercices}
                programStatus={program.status}
              />
            ))}
          </div>
        )}

        {!hasSession && (
          <div className="border-t border-white/5 p-6 text-center bg-black/20">
            <p className="text-xs text-gray-600">Aucune séance</p>
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
