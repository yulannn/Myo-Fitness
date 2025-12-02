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
      <div className="relative bg-[#252527] rounded-2xl shadow-xl border border-[#94fbdd]/10 overflow-hidden transition-all">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#94fbdd]/5 to-transparent rounded-full blur-2xl"></div>

        {/* Header */}
        <div
          onClick={isActive ? undefined : onToggleExpand}
          className={`relative w-full p-4 sm:p-5 text-left transition-colors ${!isActive ? 'cursor-pointer hover:bg-[#94fbdd]/5' : ''}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white break-words">{program.name}</h2>
                <div className={`px-2 py-1 rounded-lg font-semibold text-xs whitespace-nowrap ${isActive
                  ? 'bg-[#94fbdd]/10 text-[#94fbdd] border border-[#94fbdd]/30'
                  : 'bg-gray-700 text-gray-400 border border-gray-600'
                  }`}>
                  {isActive ? '✓ Actif' : program.status}
                </div>
              </div>

              {program.description && (
                <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">{program.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{program.sessions?.length || 0} séance{(program.sessions?.length || 0) > 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Créé le {program.createdAt ? new Date(program.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div
                onClick={handleStatusClick}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${isActive
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'bg-[#94fbdd]/10 text-[#94fbdd] hover:bg-[#94fbdd]/20'
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
                <div className="flex-shrink-0 p-2 rounded-xl bg-[#94fbdd]/10 transition-transform">
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-[#94fbdd]" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-[#94fbdd]" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message pour programmes archivés */}
        {!isActive && (
          <div className="px-4 sm:px-5 py-2 bg-gray-800/50 border-y border-gray-700">
            <p className="text-xs text-gray-400 text-center italic">
              📦 Programme archivé - Lecture seule
            </p>
          </div>
        )}

        {/* Sessions */}
        {showSessions && (
          <div className="relative border-t border-[#94fbdd]/10 p-4 sm:p-5 space-y-3 animate-fadeIn">
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
          <div className="relative border-t border-[#94fbdd]/10 p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-500 italic">Aucune séance dans ce programme.</p>
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
