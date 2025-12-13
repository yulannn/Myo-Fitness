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
import { ProgramCard } from '../../components/ui/program';
import { PlusIcon, SparklesIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

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
  const automaticProgramStartDateRef = useRef<string>(new Date().toISOString().split('T')[0]);

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

  const handleConfirmAutomatic = (name?: string, description?: string, startDate?: string) => {
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
      startDate: startDate || new Date().toISOString(),
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Mes Programmes</h1>
            <p className="text-gray-400 mt-1">Gérez et suivez votre évolution</p>
          </div>
          {programs.length > 0 && (
            <button
              onClick={openAddFlow}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#94fbdd] text-[#121214] font-semibold rounded-xl shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95"
            >
              <PlusIcon className="h-5 w-5" />
              Nouveau programme
            </button>
          )}
        </div>

        {/* Tabs - Actifs / Archivés */}
        {programs.length > 0 && (
          <div className="inline-flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'active'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Actifs <span className="text-xs opacity-50">({activePrograms.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'archived'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Archivés <span className="text-xs opacity-50">({archivedPrograms.length})</span>
            </button>
          </div>
        )}

        {/* Programs List */}
        {programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-3">
              <SparklesIcon className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Aucun programme</h3>
            <p className="text-sm text-gray-500 mb-4">Créez votre premier programme</p>
            <button
              onClick={openAddFlow}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Nouveau programme
            </button>
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
              <div className="flex flex-col items-center py-12 text-center">
                <ArchiveBoxIcon className="h-10 w-10 text-gray-700 mb-2" />
                <p className="text-sm text-gray-500">Aucun programme {activeTab === 'active' ? 'actif' : 'archivé'}</p>
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
        showClose={false}
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
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
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
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all min-h-[80px]"
              placeholder="Objectifs, focus particulier..."
              onChange={(e) =>
                (automaticProgramDescriptionRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="program-start-date" className="text-sm font-medium text-gray-300">
              Date de début
            </label>
            <input
              id="program-start-date"
              type="date"
              className="w-full min-w-0 appearance-none rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all [color-scheme:dark]"
              defaultValue={new Date().toISOString().split('T')[0]}
              onChange={(e) =>
                (automaticProgramStartDateRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Profil Fitness</label>
            <select
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
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
                  automaticProgramDescriptionRef.current,
                  automaticProgramStartDateRef.current
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
