import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArchiveBoxIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { SessionCard } from '../session';
import { ProgramStatusModal } from '../modal/ProgramStatusModal';
import useUpdateProgramStatus from '../../../api/hooks/program/useUpdateProgramStatus';

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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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

  return (
    <>
      <div className="relative bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">

        {/* Header */}
        <div
          onClick={isActive ? undefined : onToggleExpand}
          className={`relative w-full p-5 text-left transition-colors ${!isActive ? 'cursor-pointer hover:bg-white/5' : ''}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{program.name}</h2>
                <div className={`px-2.5 py-1 rounded-md font-medium text-xs whitespace-nowrap ${isActive
                  ? 'bg-[#94fbdd]/10 text-[#94fbdd] border border-[#94fbdd]/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                  {isActive ? 'En cours' : 'Archivé'}
                </div>
              </div>

              {program.description && (
                <p className="text-sm text-gray-400 line-clamp-2">{program.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs font-medium text-gray-500 pt-1">
                <span>{program.sessions?.length || 0} séance{(program.sessions?.length || 0) > 1 ? 's' : ''}</span>
                <span className="text-gray-700">•</span>
                <span>Créé le {program.createdAt ? new Date(program.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end pt-1">
              <div
                onClick={handleStatusClick}
                className={`p-2 rounded-lg transition-all cursor-pointer ${isActive
                  ? 'text-gray-500 hover:text-white hover:bg-white/10'
                  : 'text-[#94fbdd] hover:bg-[#94fbdd]/10'
                  }`}
                title={isActive ? "Archiver le programme" : "Désarchiver le programme"}
              >
                {isUpdatingStatus ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isActive ? (
                  <ArchiveBoxIcon className="h-5 w-5" />
                ) : (
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                )}
              </div>

              {hasSession && !isActive && (
                <div className="flex-shrink-0 p-2 rounded-lg text-gray-400 bg-white/5">
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message pour programmes archivés */}
        {!isActive && (
          <div className="px-5 py-2 bg-zinc-900/50 border-y border-white/5">
            <p className="text-xs text-gray-500 font-medium">
              Lecture seule
            </p>
          </div>
        )}

        {/* Sessions */}
        {showSessions && (
          <div className="relative border-t border-white/5 p-5 space-y-4 bg-black/20">
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
          <div className="relative border-t border-white/5 p-6 text-center bg-black/20">
            <p className="text-sm text-gray-500">Aucune séance dans ce programme.</p>
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
    </>
  );
};
