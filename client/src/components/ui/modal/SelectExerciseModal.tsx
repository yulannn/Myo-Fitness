import React, { useState, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, ChevronLeftIcon, UserIcon, PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import { sanitizeSearchInput, includesNormalized } from '../../../utils/stringUtils';

interface SelectExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: number) => void;
  availableExercises: ExerciceMinimal[];
}

type SortMode = 'alphabetical' | 'muscleGroup';

/* ... imports ... */

export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  availableExercises
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [showMyExercisesOnly, setShowMyExercisesOnly] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [hasInvalidChars, setHasInvalidChars] = useState(false);

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
      setShowMyExercisesOnly(false);
      setSelectedMuscleGroup(null);
      onClose();
    }, 300);
  };

  // Handle exercise selection
  const handleSelectExercise = (exerciseId: number) => {
    onSelect(exerciseId);
    handleClose();
  };


  // Filter and sort exercises
  const processedExercises = useMemo(() => {
    let filtered = availableExercises;

    // Debug logging
    console.log('🔍 SelectExerciseModal - Available exercises:', availableExercises);
    console.log('🔍 SelectExerciseModal - Show my exercises only:', showMyExercisesOnly);

    // Filter by "My Exercises Only"
    if (showMyExercisesOnly) {
      filtered = filtered.filter(ex => ex.isDefault === false);
      console.log('🔍 SelectExerciseModal - After "My Exercises" filter:', filtered);
      console.log('🔍 SelectExerciseModal - Sample exercise isDefault value:', availableExercises[0]?.isDefault);
    }

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
  }, [availableExercises, searchQuery, sortMode, showMyExercisesOnly]);

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
            {sortMode === 'muscleGroup' && selectedMuscleGroup
              ? selectedMuscleGroup
              : showMyExercisesOnly
                ? 'Mes exercices'
                : 'Sélectionner un exercice'}
          </h2>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

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
                  setShowMyExercisesOnly(false);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'alphabetical' && !showMyExercisesOnly
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
                  setShowMyExercisesOnly(false);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'muscleGroup' && !showMyExercisesOnly
                  ? 'bg-[#252527] text-white shadow-sm border border-[#94fbdd]/20'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                Par Muscle
              </button>
              <button
                onClick={() => {
                  setShowMyExercisesOnly(!showMyExercisesOnly);
                  if (!showMyExercisesOnly) {
                    setSortMode('alphabetical');
                    setSelectedMuscleGroup(null);
                  }
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${showMyExercisesOnly
                  ? 'bg-[#252527] text-[#94fbdd] shadow-sm border border-[#94fbdd]/20'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                Mes exos
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
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Exercise List */}
          <>
            {processedExercises.type === 'flat' && processedExercises.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 px-6">
                <MagnifyingGlassIcon className="h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">Aucun exercice trouvé</p>
                <p className="text-sm">Essayez une autre recherche.</p>
              </div>
            ) : processedExercises.type === 'grouped' && processedExercises.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 px-6">
                <MagnifyingGlassIcon className="h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">Aucun exercice trouvé</p>
                <p className="text-sm">Essayez une autre recherche.</p>
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
        </div>

        {/* Footer (Empty if needed, or removed if no action) */}
        {/* Removed 'Create Exercise' button area because it's now in a separate page */}
      </div>
    </div>
  );
};

const ExerciseItem = ({
  exercise,
  onSelect
}: {
  exercise: ExerciceMinimal;
  onSelect: (id: number) => void;
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const imageUrl = exercise.imageUrl
    ? (exercise.imageUrl.startsWith('http') ? exercise.imageUrl : `${API_URL}/assets/exercises_illustration/${exercise.imageUrl}`)
    : null;

  return (
    <button
      onClick={() => onSelect(exercise.id)}
      className="w-full p-3 rounded-xl bg-[#121214] border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 hover:bg-[#1a1a1c] transition-all text-left group"
    >
      <div className="flex items-center gap-4">
        {/* Image / Icon */}
        <div className="w-12 h-12 rounded-lg bg-[#252527] border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={exercise.name}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.classList.add('fallback-icon');
              }}
            />
          ) : (
            <div className="text-gray-600">
              {/* Fallback visual based on type ? simple generic for now */}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}

          {/* Fallback Icon visible when img hidden */}
          <div className="hidden fallback-icon:block text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium truncate pr-2 group-hover:text-[#94fbdd] transition-colors">
              {exercise.name}
            </span>
            <div className="p-1 rounded-full bg-[#94fbdd]/10 group-hover:bg-[#94fbdd]/20 transition-all flex-shrink-0">
              <PlusIcon className="h-5 w-5 text-[#94fbdd] group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {exercise.bodyWeight && (
            <span className="text-xs text-gray-500 block mt-0.5">Poids du corps</span>
          )}

          {exercise.isDefault === false && (
            <span className="text-xs text-[#94fbdd] flex items-center gap-1 mt-0.5">
              <UserIcon className="w-3 h-3" />
              Créé par vous
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

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
