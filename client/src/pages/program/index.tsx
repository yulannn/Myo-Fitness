import useActiveProgram from '../../api/hooks/program/useGetActiveProgram';
import useArchivedPrograms from '../../api/hooks/program/useGetArchivedPrograms';
import useCreateProgram from '../../api/hooks/program/useCreateProgram';
import useCreateManualProgram from '../../api/hooks/program/useCreateManualProgram';
import useExercicesMinimal from '../../api/hooks/exercice/useGetExercicesMinimal';
import useUpdateFitnessProfile from '../../api/hooks/fitness-profile/useUpdateFitnessProfile';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Modal,
  ModalContent,
} from '../../components/ui/modal';
import { ManualProgramModal } from '../../components/ui/modal/ManualProgramModal';
import { BottomSheet } from '../../components/ui/BottomSheet';
import useFitnessProfilesByUser from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser';

import { ProgramCard } from '../../components/ui/program';
import { PlusIcon, SparklesIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon, ArchiveBoxIcon, CheckIcon, StarIcon } from '@heroicons/react/24/outline';
import { getAvailableTemplates, getRecommendedTemplate } from '../../utils/template-selector';
import type { ProgramTemplate } from '../../types/program.type';

const Program = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [automaticOpen, setAutomaticOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());

  const { data: fitnessProfile } = useFitnessProfilesByUser();

  // ✅ OPTIMISATION: Récupère le programme actif au chargement
  const { data: activeProgram, isLoading: isLoadingActive } = useActiveProgram();

  // Récupère les programmes archivés (toujours chargés pour le compteur)
  const { data: archivedPrograms = [] } = useArchivedPrograms(true);

  const { data: exercices = [] } = useExercicesMinimal();
  const { mutate, isPending } = useCreateProgram();
  const { mutate: mutateManual } = useCreateManualProgram();
  const { mutate: updateProfile } = useUpdateFitnessProfile();

  // const { user } = useAuth();

  // 🎯 États pour le sélecteur de template
  const [selectedFrequency, setSelectedFrequency] = useState<number>(fitnessProfile?.trainingFrequency || 3);
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);

  // Synchroniser la fréquence avec le profil fitness
  useEffect(() => {
    if (fitnessProfile?.trainingFrequency) {
      setSelectedFrequency(fitnessProfile.trainingFrequency);
    }
  }, [fitnessProfile?.trainingFrequency]);

  // Réinitialiser le template sélectionné quand la fréquence change (pour garder le recommandé)
  useEffect(() => {
    setSelectedTemplate(null);
  }, [selectedFrequency]);

  // Calculer les templates disponibles
  const availableTemplates = useMemo(
    () => getAvailableTemplates(selectedFrequency),
    [selectedFrequency]
  );

  // Template effectif (sélectionné ou recommandé par défaut)
  const effectiveTemplate = useMemo(() => {
    if (selectedTemplate) return selectedTemplate;
    return getRecommendedTemplate(selectedFrequency).template;
  }, [selectedTemplate, selectedFrequency]);

  // Construire les tableaux de programmes
  const activePrograms = useMemo(
    () => (activeProgram ? [activeProgram] : []),
    [activeProgram]
  );

  const hasActiveProgram = activePrograms.length > 0;


  const automaticProgramNameRef = useRef<string>('');

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

  const handleConfirmAutomatic = (name?: string, startDate?: string) => {
    if (!fitnessProfile?.id) {
      console.error('Aucun profil fitness trouvé');
      return;
    }

    // 🎯 Créer le payload avec le template sélectionné
    const payload = {
      name: name || 'Programme généré',
      fitnessProfileId: fitnessProfile.id,
      status: 'ACTIVE',
      startDate: startDate || new Date().toISOString(),
      template: effectiveTemplate, // 🆕 Inclure le template choisi
    } as any;

    setIsGenerating(true);

    // 🆕 Si la fréquence a changé, mettre à jour le profil d'abord
    const frequencyChanged = selectedFrequency !== fitnessProfile.trainingFrequency;

    const createProgram = () => {
      mutate(payload, {
        onSuccess: () => {
          setIsGenerating(false);
          setAutomaticOpen(false);
          // Reset pour la prochaine fois
          setSelectedTemplate(null);
        },
        onError: () => {
          setIsGenerating(false);
        },
      });
    };

    if (frequencyChanged) {
      // Mettre à jour le profil puis créer le programme
      updateProfile(
        { id: fitnessProfile.id, trainingFrequency: selectedFrequency },
        {
          onSuccess: () => createProgram(),
          onError: () => {
            setIsGenerating(false);
            console.error('Erreur lors de la mise à jour de la fréquence');
          },
        }
      );
    } else {
      createProgram();
    }
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


  const isLoading = isLoadingActive;

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
          {(activePrograms.length > 0 || archivedPrograms.length > 0) && (
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
        {(activePrograms.length + archivedPrograms.length) > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 w-full rounded-lg text-sm font-medium transition-colors ${activeTab === 'active'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Actifs <span className="text-xs opacity-50">({activePrograms.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 w-full rounded-lg text-sm font-medium transition-colors ${activeTab === 'archived'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Archivés <span className="text-xs opacity-50">({archivedPrograms.length})</span>
            </button>
          </div>
        )}

        {/* Programs List */}
        {(activePrograms.length === 0 && archivedPrograms.length === 0) ? (
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
                activeProgram={activePrograms[0]}
              />
            ))}

            {(activeTab === 'active' ? activePrograms : archivedPrograms).length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <ArchiveBoxIcon className="h-12 w-12 text-gray-700 mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">
                  Aucun programme {activeTab === 'active' ? 'actif' : 'archivé'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {activeTab === 'active'
                    ? 'Créez un nouveau programme pour commencer'
                    : 'Les programmes archivés apparaîtront ici'
                  }
                </p>
                {activeTab === 'active' && (
                  <button
                    onClick={openAddFlow}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Nouveau programme
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} className="max-w-sm bg-[#18181b] border border-white/10 rounded-2xl">
        <ModalContent className="!p-0 overflow-visible">
          <div className="p-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-[#94fbdd]/10 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-[#94fbdd]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">
                  Programme actif détecté
                </h3>
                <p className="text-sm text-gray-400">
                  Un programme est déjà actif. Il sera archivé et remplacé par le nouveau.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmContinue}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] shadow-lg shadow-[#94fbdd]/20 transition-all flex items-center justify-center gap-2"
              >
                Continuer
              </button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      <Modal isOpen={choiceOpen} onClose={() => setChoiceOpen(false)} className="max-w-sm bg-[#18181b] border border-white/10 rounded-2xl">
        <ModalContent className="!p-0 overflow-visible">
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white text-center mb-6">
              Créer un programme
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setAutomaticOpen(true);
                  setChoiceOpen(false);
                }}
                disabled={isPending}
                className="w-full p-4 rounded-xl bg-[#94fbdd]/10 hover:bg-[#94fbdd]/20 border border-[#94fbdd]/20 flex items-center gap-4 transition-all group"
              >
                <div className="p-2 bg-[#94fbdd]/20 rounded-lg group-hover:scale-110 transition-transform">
                  <SparklesIcon className="h-5 w-5 text-[#94fbdd]" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white text-sm">Automatique (IA)</h4>
                  <p className="text-xs text-gray-400">Généré selon votre profil</p>
                </div>
              </button>

              <button
                onClick={handleCreateManual}
                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-4 transition-all group"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-gray-300" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white text-sm">Manuel</h4>
                  <p className="text-xs text-gray-400">Créez de zéro</p>
                </div>
              </button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      <BottomSheet
        isOpen={automaticOpen}
        onClose={() => setAutomaticOpen(false)}
        title="Personnaliser le programme"
      >
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="program-name" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Nom du programme
            </label>
            <input
              id="program-name"
              type="text"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
              placeholder="Ex: Prise de masse estivale"
              onChange={(e) =>
                (automaticProgramNameRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>



          <div className="space-y-1.5">
            <label htmlFor="program-start-date" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Date de début
            </label>
            <input
              id="program-start-date"
              type="date"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all [color-scheme:dark]"
              defaultValue={new Date().toISOString().split('T')[0]}
              onChange={(e) =>
                (automaticProgramStartDateRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>

          {/* 🎯 Sélecteur de fréquence */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Fréquence d'entraînement
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setSelectedFrequency(freq)}
                  disabled={isGenerating}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedFrequency === freq
                    ? 'bg-[#94fbdd] text-[#121214] shadow-lg shadow-[#94fbdd]/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    } disabled:opacity-50`}
                >
                  {freq}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              {selectedFrequency} jour{selectedFrequency > 1 ? 's' : ''} par semaine
              {selectedFrequency !== fitnessProfile?.trainingFrequency && (
                <span className="text-[#94fbdd] ml-1">(modifié)</span>
              )}
            </p>
          </div>

          {/* 🎯 Sélecteur de template */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Template d'entraînement
            </label>
            <div className="space-y-2">
              {availableTemplates.map((t) => (
                <button
                  key={t.template}
                  type="button"
                  onClick={() => setSelectedTemplate(t.template)}
                  disabled={isGenerating}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${effectiveTemplate === t.template
                    ? 'bg-[#94fbdd]/10 border-[#94fbdd] shadow-lg shadow-[#94fbdd]/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${effectiveTemplate === t.template
                        ? 'border-[#94fbdd] bg-[#94fbdd]'
                        : 'border-gray-500'
                        }`}>
                        {effectiveTemplate === t.template && (
                          <CheckIcon className="w-3 h-3 text-[#121214] stroke-[3]" />
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${effectiveTemplate === t.template ? 'text-white' : 'text-gray-300'}`}>
                          {t.label}
                        </p>
                        <p className="text-xs text-gray-500">{t.description}</p>
                      </div>
                    </div>
                    {t.isRecommended && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#94fbdd]/20 border border-[#94fbdd]/30">
                        <StarIcon className="w-3 h-3 text-[#94fbdd]" />
                        <span className="text-[10px] font-bold text-[#94fbdd] uppercase">Recommandé</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 font-mono">
                    {t.sessionStructure.join(' → ')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="p-3 bg-[#94fbdd]/10 rounded-lg flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#94fbdd] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-xs text-[#94fbdd] font-medium">L'IA génère votre programme...</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6 pt-2 mb-6">
            <button
              onClick={() => setAutomaticOpen(false)}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              type="button"
            >
              Annuler
            </button>
            <button
              onClick={() =>
                handleConfirmAutomatic(
                  automaticProgramNameRef.current,
                  automaticProgramStartDateRef.current
                )
              }
              disabled={isGenerating || !fitnessProfile}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] shadow-lg shadow-[#94fbdd]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="button"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                'Générer'
              )}
            </button>
          </div>
        </div>
      </BottomSheet>

      {fitnessProfile && (
        <ManualProgramModal
          isOpen={manualOpen}
          onClose={() => setManualOpen(false)}
          onConfirm={handleManualProgramConfirm}
          fitnessProfileId={fitnessProfile.id}
          availableExercises={exercices}
        />
      )}
    </div >
  );
};

export default Program;
