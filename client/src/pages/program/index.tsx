import { useProgramsByUser } from '../../api/hooks/program/useGetProgramsByUser';
import useCreateProgram from '../../api/hooks/program/useCreateProgram';
import useCreateManualProgram from '../../api/hooks/program/useCreateManualProgram';
import useExercicesByUser from '../../api/hooks/exercice/useGetExercicesByUser';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Modal,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '../../components/ui/modal';
import { ManualProgramModal } from '../../components/ui/modal/ManualProgramModal';
import useFitnessProfilesByUser from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser';
import { useAuth } from '../../context/AuthContext';
import { SessionCard } from '../../components/ui/session';
import { PlusIcon, SparklesIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, ArchiveBoxIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import useUpdateProgramStatus from '../../api/hooks/program/useUpdateProgramStatus';
import { ProgramStatusModal } from '../../components/ui/modal/ProgramStatusModal';

// Composant ProgramCard minimaliste avec accordéon
interface ProgramCardProps {
  program: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  exercices: any[];
  sortSessions: (sessions: any[]) => any[];
  activeProgram?: any;
}

const ProgramCard = ({ program, isExpanded, onToggleExpand, exercices, sortSessions, activeProgram }: ProgramCardProps) => {
  const hasSession = program.sessions && program.sessions.length > 0;
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProgramStatus();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const isActive = program.status === 'ACTIVE';
  // Si le programme est actif, il est toujours considéré comme "étendu" pour l'affichage
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

const Program = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [automaticOpen, setAutomaticOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());

  const { data: fitnessProfile } = useFitnessProfilesByUser();
  const { data, isLoading } = useProgramsByUser();
  const { data: exercices = [] } = useExercicesByUser();
  const { mutate, isPending } = useCreateProgram();
  const { mutate: mutateManual } = useCreateManualProgram();

  const programs = Array.isArray(data) ? data : [];
  const { user } = useAuth();

  // Séparer les programmes actifs et archivés
  const activePrograms = useMemo(
    () => programs.filter((p: any) => p.status === 'ACTIVE'),
    [programs]
  );

  const archivedPrograms = useMemo(
    () => programs.filter((p: any) => p.status === 'ARCHIVED'),
    [programs]
  );

  // Ouvrir automatiquement les programmes actifs par défaut
  useEffect(() => {
    if (activePrograms.length > 0) {
      const activeIds = activePrograms.map((p: any) => p.id);
      setExpandedPrograms(prev => {
        const newSet = new Set(prev);
        activeIds.forEach((id: number) => newSet.add(id));
        return newSet;
      });
    }
  }, [activePrograms]);

  const hasActiveProgram = activePrograms.length > 0;
  const activeProgram = activePrograms[0]; // Le premier programme actif (il ne devrait y en avoir qu'un)

  const automaticProgramNameRef = useRef<string>('');
  const automaticProgramDescriptionRef = useRef<string>('');

  const toggleProgramExpansion = (programId: number) => {
    setExpandedPrograms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };


  const openAddFlow = () => {
    if (hasActiveProgram) {
      setConfirmOpen(true);
    } else {
      setChoiceOpen(true);
    }
  };

  const handleConfirmContinue = () => {
    setConfirmOpen(false);
    setChoiceOpen(true);
  };

  const handleConfirmAutomatic = (name?: string, description?: string) => {
    if (!selectedProfileId) {
      setSelectionError(
        'Veuillez sélectionner un profil fitness avant de continuer.',
      );
      return;
    }
    setSelectionError(null);

    const profileIdNumber = Number(selectedProfileId);
    if (Number.isNaN(profileIdNumber) || profileIdNumber <= 0) {
      setSelectionError('Profil invalide sélectionné.');
      return;
    }

    const payload = {
      name: name || 'Programme généré',
      description: description || 'Programme généré automatiquement',
      fitnessProfileId: profileIdNumber,
      status: 'ACTIVE',
    } as any;

    setIsGenerating(true);

    mutate(payload, {
      onSuccess: () => {
        setIsGenerating(false);
        setAutomaticOpen(false);
        setSelectedProfileId('');
      },
      onError: () => {
        setIsGenerating(false);
      },
    });
  };

  const handleCreateManual = () => {
    setChoiceOpen(false);
    setManualOpen(true);
  };

  const handleManualProgramConfirm = (data: any) => {
    mutateManual(data, {
      onSuccess: () => {
        setManualOpen(false);
      },
      onError: (error) => {
        console.error('Error creating manual program:', error);
        alert('Erreur lors de la création du programme. Veuillez réessayer.');
      },
    });
  };

  const sortSessions = (sessions: any[]) => {
    if (!sessions || !Array.isArray(sessions)) return [];

    return [...sessions].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return -1;
      if (!b.date) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121214]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#94fbdd]/20 border-t-[#94fbdd]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-[#94fbdd]/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] pb-24">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Header - Mobile Optimized */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Mes Programmes</h1>
            <p className="text-sm text-gray-400 mt-1">Gérez vos programmes d'entraînement</p>
          </div>
          <button
            onClick={openAddFlow}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#94fbdd] text-[#121214] font-bold rounded-2xl shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 hover:shadow-xl hover:shadow-[#94fbdd]/30 transition-all active:scale-95"
          >
            <PlusIcon className="h-5 w-5" />
            Nouveau programme
          </button>
        </div>

        {/* Tabs - Actifs / Archivés */}
        {programs.length > 0 && (
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-4 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all ${activeTab === 'active'
                ? 'bg-[#94fbdd] text-[#121214] shadow-lg shadow-[#94fbdd]/20'
                : 'bg-[#252527] text-gray-400 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30'
                }`}
            >
              Actifs ({activePrograms.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex-1 px-4 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all ${activeTab === 'archived'
                ? 'bg-[#94fbdd] text-[#121214] shadow-lg shadow-[#94fbdd]/20'
                : 'bg-[#252527] text-gray-400 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30'
                }`}
            >
              Archivés ({archivedPrograms.length})
            </button>
          </div>
        )}

        {/* Programs List */}
        {programs.length === 0 ? (
          <div className="relative bg-[#252527] rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-[#94fbdd]/10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#94fbdd]/20 to-[#94fbdd]/5 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                <SparklesIcon className="h-10 w-10 sm:h-12 sm:w-12 text-[#94fbdd]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Commencez votre voyage</h3>
              <p className="text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                Créez votre premier programme personnalisé et transformez vos objectifs en réalité.
              </p>
              <button
                onClick={openAddFlow}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#94fbdd]/90 transition-all active:scale-95 shadow-lg shadow-[#94fbdd]/20"
              >
                <PlusIcon className="h-5 w-5" />
                Créer mon programme
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {(activeTab === 'active' ? activePrograms : archivedPrograms).map((program: any) => (
              <ProgramCard
                key={program.id}
                program={program}
                isExpanded={expandedPrograms.has(program.id)}
                onToggleExpand={() => toggleProgramExpansion(program.id)}
                exercices={exercices}
                sortSessions={sortSessions}
                activeProgram={activeProgram}
              />
            ))}

            {(activeTab === 'active' ? activePrograms : archivedPrograms).length === 0 && (
              <div className="text-center py-12 bg-[#252527] rounded-2xl border border-dashed border-gray-700">
                <p className="text-gray-400">Aucun programme {activeTab === 'active' ? 'actif' : 'archivé'}.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <ModalHeader>
          <div className="flex items-center gap-2 sm:gap-3 justify-center">
            <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#94fbdd]" />
            <ModalTitle className="text-lg sm:text-2xl">Programme actif détecté</ModalTitle>
          </div>
        </ModalHeader>
        <div className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-300 text-center">
          Vous avez déjà un programme actif. Si vous continuez, le programme actuel sera archivé et remplacé par le nouveau.
        </div>
        <ModalFooter>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfirmOpen(false)}
              className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmContinue}
              className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95"
            >
              Continuer
            </button>
          </div>
        </ModalFooter>
      </Modal>

      <Modal isOpen={choiceOpen} onClose={() => setChoiceOpen(false)}>
        <ModalHeader>
          <ModalTitle className="text-lg sm:text-2xl">Créer un programme</ModalTitle>
        </ModalHeader>
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
          <button
            onClick={() => {
              setAutomaticOpen(true);
              setChoiceOpen(false);
            }}
            disabled={isPending}
            className="w-full p-4 sm:p-5 rounded-2xl border-2 border-[#94fbdd]/30 bg-[#94fbdd]/5 hover:bg-[#94fbdd]/10 flex items-center gap-3 sm:gap-4 transition-all group"
          >
            <div className="p-2 sm:p-3 bg-[#94fbdd]/20 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
              <SparklesIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#94fbdd]" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h4 className="font-bold text-white text-base sm:text-lg">Générer automatiquement</h4>
              <p className="text-xs sm:text-sm text-gray-400 break-words">L'IA crée un programme adapté à votre profil</p>
            </div>
          </button>

          <button
            onClick={handleCreateManual}
            className="w-full p-4 sm:p-5 rounded-2xl border-2 border-gray-600 hover:border-gray-500 bg-[#121214] hover:bg-[#252527] flex items-center gap-3 sm:gap-4 transition-all group"
          >
            <div className="p-2 sm:p-3 bg-gray-700 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
              <ClipboardDocumentListIcon className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h4 className="font-bold text-white text-base sm:text-lg">Créer manuellement</h4>
              <p className="text-xs sm:text-sm text-gray-400 break-words">Construisez votre programme exercice par exercice</p>
            </div>
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={automaticOpen}
        onClose={() => {
          setAutomaticOpen(false);
          setSelectedProfileId('');
        }}
      >
        <ModalHeader>
          <ModalTitle className="text-lg sm:text-2xl">Personnalisez votre programme</ModalTitle>
        </ModalHeader>
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label htmlFor="program-name" className="text-sm font-medium text-gray-300">
              Nom du programme
            </label>
            <input
              id="program-name"
              type="text"
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
              placeholder="Ex: Prise de masse estivale"
              onChange={(e) =>
                (automaticProgramNameRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="program-description" className="text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="program-description"
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all min-h-[80px]"
              placeholder="Objectifs, focus particulier..."
              onChange={(e) =>
                (automaticProgramDescriptionRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Profil Fitness</label>
            <select
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              disabled={isGenerating}
              required
            >
              <option value="" disabled>
                Choisir un profil...
              </option>
              {fitnessProfile && (
                <option value={fitnessProfile.id}>
                  {user?.name} – {fitnessProfile.age} ans – {fitnessProfile.weight} kg
                </option>
              )}
            </select>
            {selectionError && (
              <p className="text-xs text-red-400 mt-2">{selectionError}</p>
            )}
          </div>

          {isGenerating && (
            <div className="p-3 sm:p-4 bg-[#94fbdd]/10 rounded-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#94fbdd] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-xs sm:text-sm text-[#94fbdd] font-medium">L'IA génère votre programme sur mesure...</p>
            </div>
          )}
        </div>

        <ModalFooter>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setAutomaticOpen(false); setSelectedProfileId(''); }}
              disabled={isGenerating}
              className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={() =>
                handleConfirmAutomatic(
                  automaticProgramNameRef.current,
                  automaticProgramDescriptionRef.current
                )
              }
              disabled={isGenerating || !selectedProfileId}
              className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Génération...' : 'Générer le programme'}
            </button>
          </div>
        </ModalFooter>
      </Modal>

      {fitnessProfile && (
        <ManualProgramModal
          isOpen={manualOpen}
          onClose={() => setManualOpen(false)}
          onConfirm={handleManualProgramConfirm}
          fitnessProfileId={fitnessProfile.id}
          availableExercises={exercices}
        />
      )}
    </div>
  );
};

export default Program;
