import React, { useState, useMemo } from 'react';
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon, ChevronRightIcon, ChevronLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import { sanitizeSearchInput, includesNormalized } from '../../../utils/stringUtils';
import { useCreateExercice } from '../../../api/hooks/exercice/useCreateExercice';
import { useMuscleGroups } from '../../../api/hooks/muscle-group/useGetMuscleGroups';

interface SelectExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: number) => void;
  availableExercises: ExerciceMinimal[];
}

type SortMode = 'alphabetical' | 'muscleGroup';

export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  availableExercises
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [hasInvalidChars, setHasInvalidChars] = useState(false);

  // Create exercise mode
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscleGroupIds, setNewExerciseMuscleGroupIds] = useState<number[]>([]);
  const [newExerciseIsBodyweight, setNewExerciseIsBodyweight] = useState(false);

  const createExerciseMutation = useCreateExercice();
  const { data: muscleGroups = [] } = useMuscleGroups();

  // Handle search input with validation
  const handleSearchChange = (value: string) => {
    // Sanitize input to allow only valid characters
    const sanitized = sanitizeSearchInput(value);

    // Detect if invalid characters were filtered
    if (sanitized !== value) {
      setHasInvalidChars(true);
      // Reset warning after 2 seconds
      setTimeout(() => setHasInvalidChars(false), 2000);
    }

    setSearchQuery(sanitized);
  };

  // Handle smooth closing
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setSearchQuery('');
      setSortMode('alphabetical');
      setSelectedMuscleGroup(null);
      setIsCreatingExercise(false);
      setNewExerciseName('');
      setNewExerciseMuscleGroupIds([]);
      setNewExerciseIsBodyweight(false);
      onClose();
    }, 300);
  };

  // Handle exercise selection
  const handleSelectExercise = (exerciseId: number) => {
    onSelect(exerciseId);
    handleClose();
  };

  // Handle create exercise
  const handleCreateExercise = async () => {
    if (!newExerciseName.trim() || newExerciseMuscleGroupIds.length === 0) return;

    try {
      await createExerciseMutation.mutateAsync({
        name: newExerciseName.trim(),
        difficulty: 3, // Default difficulty
        bodyWeight: newExerciseIsBodyweight,
        Materials: !newExerciseIsBodyweight,
        muscleGroupIds: newExerciseMuscleGroupIds,
      });

      // Return to the exercise list after successful creation
      resetCreateMode();
    } catch (error) {
      console.error('Failed to create exercise:', error);
    }
  };

  // Reset create mode
  const resetCreateMode = () => {
    setIsCreatingExercise(false);
    setNewExerciseName('');
    setNewExerciseMuscleGroupIds([]);
    setNewExerciseIsBodyweight(false);
  };

  // Toggle muscle group selection
  const toggleMuscleGroup = (groupId: number) => {
    setNewExerciseMuscleGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Filter and sort exercises
  const processedExercises = useMemo(() => {
    let filtered = availableExercises;

    // Search filter - normalized (accent-insensitive)
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex =>
        includesNormalized(ex.name, searchQuery)
      );
    }

    if (sortMode === 'alphabetical') {
      return {
        type: 'flat' as const,
        data: [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      };
    } else {
      // Group by PRIMARY muscle group (isPrimary: true)
      const groups: Record<string, ExerciceMinimal[]> = {};
      const otherKey = 'Autres';

      filtered.forEach(ex => {
        // Find the PRIMARY muscle group (isPrimary = true)
        const primaryMuscle = ex.groupes?.find(g => g.isPrimary);
        const groupName = primaryMuscle?.groupe.name ?? otherKey;

        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(ex);
      });

      // Sort groups alphabetically
      const sortedGroupNames = Object.keys(groups).sort((a, b) => {
        if (a === otherKey) return 1;
        if (b === otherKey) return -1;
        return a.localeCompare(b);
      });

      // Sort exercises within groups
      sortedGroupNames.forEach(name => {
        groups[name].sort((a, b) => a.name.localeCompare(b.name));
      });

      return {
        type: 'grouped' as const,
        data: sortedGroupNames.map(name => ({
          name,
          exercises: groups[name]
        }))
      };
    }
  }, [availableExercises, searchQuery, sortMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end">
      {/* Backdrop - NO BLUR */}
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative z-[110] w-full h-[92vh] bg-[#252527] rounded-t-3xl shadow-2xl border-t border-x border-[#94fbdd]/10 flex flex-col transition-all duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 space-y-4">
          {/* Drag Handle */}
          <div className="flex justify-center">
            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center">
            {isCreatingExercise
              ? 'Créer un exercice'
              : sortMode === 'muscleGroup' && selectedMuscleGroup
                ? selectedMuscleGroup
                : 'Sélectionner un exercice'}
          </h2>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Create Mode Content */}
          {isCreatingExercise ? (
            <div className="space-y-4">
              {/* Back button */}
              <button
                onClick={resetCreateMode}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#121214] border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 hover:bg-[#1a1a1c] transition-all text-white"
              >
                <ChevronLeftIcon className="h-5 w-5 text-[#94fbdd]" />
                <span className="font-medium">Retour à la liste</span>
              </button>
            </div>
          ) : (
            <>
              {/* Sort Toggle or Back Button */}
              {sortMode === 'muscleGroup' && selectedMuscleGroup ? (
                <button
                  onClick={() => setSelectedMuscleGroup(null)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#121214] border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 hover:bg-[#1a1a1c] transition-all text-white"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-[#94fbdd]" />
                  <span className="font-medium">Retour aux groupes musculaires</span>
                </button>
              ) : (
                <div className="flex p-1 bg-[#121214] rounded-xl border border-[#94fbdd]/10">
                  <button
                    onClick={() => {
                      setSortMode('alphabetical');
                      setSelectedMuscleGroup(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'alphabetical'
                      ? 'bg-[#252527] text-white shadow-sm border border-[#94fbdd]/20'
                      : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    Alphabétique
                  </button>
                  <button
                    onClick={() => {
                      setSortMode('muscleGroup');
                      setSelectedMuscleGroup(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'muscleGroup'
                      ? 'bg-[#252527] text-white shadow-sm border border-[#94fbdd]/20'
                      : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    Par Muscle
                  </button>
                </div>
              )}

              {/* Search Bar - Only show in alphabetical mode or when a muscle group is selected */}
              {(sortMode === 'alphabetical' || selectedMuscleGroup) && (
                <div className="space-y-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Rechercher un exercice..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#121214] border border-[#94fbdd]/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Validation feedback */}
                  {hasInvalidChars && (
                    <p className="text-xs text-orange-400 animate-pulse px-1">
                      ⚠️ Seuls les lettres, chiffres, espaces et tirets sont autorisés
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {isCreatingExercise ? (
            /* Create Exercise Form */
            <div className="px-6 py-4 space-y-5">
              {/* Exercise Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Nom de l'exercice *</label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="Ex: Développé incliné haltères"
                  className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-[#94fbdd]/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all"
                  maxLength={100}
                />
              </div>

              {/* Muscle Groups - Multiple Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  Groupes musculaires ciblés *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {muscleGroups.map((group) => {
                    const isSelected = newExerciseMuscleGroupIds.includes(group.id);
                    const isPrimary = newExerciseMuscleGroupIds[0] === group.id;
                    return (
                      <button
                        key={group.id}
                        onClick={() => toggleMuscleGroup(group.id)}
                        className={`relative p-3 rounded-xl text-sm font-medium transition-all ${isSelected
                          ? 'bg-[#94fbdd] text-[#09090b]'
                          : 'bg-[#121214] border border-[#94fbdd]/10 text-gray-300 hover:border-[#94fbdd]/30'
                          }`}
                      >
                        {group.name}
                        {isPrimary && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#09090b] text-[#94fbdd] text-[10px] font-bold rounded-full flex items-center justify-center">
                            1
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {newExerciseMuscleGroupIds.length > 0 && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#09090b] text-[#94fbdd] text-[8px] font-bold rounded-full flex items-center justify-center">1</span>
                    muscle principal
                  </p>
                )}
              </div>

              {/* Bodyweight Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#121214] border border-[#94fbdd]/10">
                <div>
                  <p className="text-white font-medium">Poids du corps</p>
                  <p className="text-sm text-gray-500">Exercice sans matériel</p>
                </div>
                <button
                  onClick={() => setNewExerciseIsBodyweight(!newExerciseIsBodyweight)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${newExerciseIsBodyweight ? 'bg-[#94fbdd]' : 'bg-gray-600'
                    }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${newExerciseIsBodyweight ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateExercise}
                disabled={!newExerciseName.trim() || newExerciseMuscleGroupIds.length === 0 || createExerciseMutation.isPending}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${!newExerciseName.trim() || newExerciseMuscleGroupIds.length === 0 || createExerciseMutation.isPending
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#94fbdd] text-[#09090b] hover:bg-[#7de0c4] active:scale-[0.98]'
                  }`}
              >
                {createExerciseMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Créer et ajouter
                  </>
                )}
              </button>

              {createExerciseMutation.isError && (
                <p className="text-sm text-red-400 text-center">
                  Erreur lors de la création. Veuillez réessayer.
                </p>
              )}
            </div>
          ) : (
            /* Exercise List */
            <>
              {processedExercises.type === 'flat' && processedExercises.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 px-6">
                  <MagnifyingGlassIcon className="h-12 w-12 opacity-50" />
                  <p className="text-lg font-medium">Aucun exercice trouvé</p>
                  <p className="text-sm">Essayez une autre recherche ou créez le vôtre</p>
                </div>
              ) : processedExercises.type === 'grouped' && processedExercises.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 px-6">
                  <MagnifyingGlassIcon className="h-12 w-12 opacity-50" />
                  <p className="text-lg font-medium">Aucun exercice trouvé</p>
                  <p className="text-sm">Essayez une autre recherche ou créez le vôtre</p>
                </div>
              ) : (
                <div className="space-y-2 pb-6 px-6 pt-2">
                  {processedExercises.type === 'flat' ? (
                    // Flat List (Alphabetical)
                    processedExercises.data.map((exercise) => (
                      <ExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        onSelect={handleSelectExercise}
                      />
                    ))
                  ) : selectedMuscleGroup ? (
                    // Exercises for selected muscle group
                    processedExercises.data
                      .find(group => group.name === selectedMuscleGroup)
                      ?.exercises.map((exercise) => (
                        <ExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          onSelect={handleSelectExercise}
                        />
                      ))
                  ) : (
                    // Muscle Groups List
                    processedExercises.data.map((group) => (
                      <MuscleGroupItem
                        key={group.name}
                        groupName={group.name}
                        exerciseCount={group.exercises.length}
                        onSelect={() => setSelectedMuscleGroup(group.name)}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-[#94fbdd]/10">
          {!isCreatingExercise ? (
            <button
              onClick={() => setIsCreatingExercise(true)}
              className="w-full py-3 rounded-xl bg-[#121214] border border-dashed border-[#94fbdd]/30 hover:border-[#94fbdd]/50 hover:bg-[#1a1a1c] transition-all flex items-center justify-center gap-2 text-[#94fbdd] font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Créer un exercice personnalisé
            </button>
          ) : (
            <p className="text-center text-gray-500 text-sm">
              Votre exercice sera disponible uniquement pour vous
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual exercise items
const ExerciseItem = ({
  exercise,
  onSelect
}: {
  exercise: ExerciceMinimal;
  onSelect: (id: number) => void;
}) => (
  <button
    onClick={() => onSelect(exercise.id)}
    className="w-full p-4 rounded-xl bg-[#121214] border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 hover:bg-[#1a1a1c] transition-all text-left group"
  >
    <div className="flex items-center justify-between">
      <span className="text-white font-medium group-hover:text-[#94fbdd] transition-colors">
        {exercise.name}
      </span>
      <div className="p-1 rounded-full bg-[#94fbdd]/10 group-hover:bg-[#94fbdd]/20 transition-all">
        <PlusIcon className="h-5 w-5 text-[#94fbdd] group-hover:scale-110 transition-transform" />
      </div>
    </div>
  </button>
);

// Sub-component for muscle group items
const MuscleGroupItem = ({
  groupName,
  exerciseCount,
  onSelect
}: {
  groupName: string;
  exerciseCount: number;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className="w-full p-5 rounded-xl bg-[#121214] border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 hover:bg-[#1a1a1c] transition-all text-left group"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-white font-semibold text-base group-hover:text-[#94fbdd] transition-colors mb-1">
          {groupName}
        </h3>
        <p className="text-gray-400 text-sm">
          {exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}
        </p>
      </div>
      <div className="p-2 rounded-full bg-[#94fbdd]/10 group-hover:bg-[#94fbdd]/20 transition-all">
        <ChevronRightIcon className="h-5 w-5 text-[#94fbdd] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  </button>
);
