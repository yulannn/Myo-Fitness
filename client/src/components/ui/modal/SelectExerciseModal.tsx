import React, { useState, useMemo } from 'react';
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { ExerciceMinimal } from '../../../types/exercice.type';

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
  const [isClosing, setIsClosing] = useState(false);

  // Handle smooth closing
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setSearchQuery('');
      setSortMode('alphabetical');
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

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query)
      );
    }

    if (sortMode === 'alphabetical') {
      return {
        type: 'flat' as const,
        data: [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      };
    } else {
      // Group by muscle group
      const groups: Record<string, ExerciceMinimal[]> = {};
      const otherKey = 'Autres';

      filtered.forEach(ex => {
        const groupName = ex.groupes && ex.groupes.length > 0 && ex.groupes[0].groupe
          ? ex.groupes[0].groupe.name
          : otherKey;

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
            Sélectionner un exercice
          </h2>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Sort Toggle */}
          <div className="flex p-1 bg-[#121214] rounded-xl border border-[#94fbdd]/10">
            <button
              onClick={() => setSortMode('alphabetical')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'alphabetical'
                ? 'bg-[#252527] text-white shadow-sm border border-[#94fbdd]/20'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Alphabétique
            </button>
            <button
              onClick={() => setSortMode('muscleGroup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'muscleGroup'
                ? 'bg-[#252527] text-white shadow-sm border border-[#94fbdd]/20'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Par Muscle
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>

        {/* Scrollable Exercise List */}
        <div className="flex-1 overflow-y-auto">
          {processedExercises.type === 'flat' && processedExercises.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 px-6">
              <MagnifyingGlassIcon className="h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">Aucun exercice trouvé</p>
              <p className="text-sm">Essayez une autre recherche</p>
            </div>
          ) : processedExercises.type === 'grouped' && processedExercises.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 px-6">
              <MagnifyingGlassIcon className="h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">Aucun exercice trouvé</p>
              <p className="text-sm">Essayez une autre recherche</p>
            </div>
          ) : (
            <div className="space-y-2 pb-6 px-6 pt-2">
              {processedExercises.type === 'flat' ? (
                // Flat List
                processedExercises.data.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    onSelect={handleSelectExercise}
                  />
                ))
              ) : (
                // Grouped List
                processedExercises.data.map((group) => (
                  <div key={group.name} className="space-y-2 mb-4">
                    <h3 className="text-[#94fbdd] text-xs font-bold uppercase tracking-wider px-1 sticky top-0 bg-[#252527] py-2 z-10 shadow-sm">
                      {group.name}
                    </h3>
                    {group.exercises.map((exercise) => (
                      <ExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        onSelect={handleSelectExercise}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-[#94fbdd]/10">
          <p className="text-center text-gray-400 text-sm">
            {availableExercises.length} exercice{availableExercises.length > 1 ? 's' : ''} disponible{availableExercises.length > 1 ? 's' : ''}
          </p>
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
