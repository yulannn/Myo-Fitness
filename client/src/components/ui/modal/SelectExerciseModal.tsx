import React, { useState, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { ExerciceMinimal } from '../../../types/exercice.type';

interface SelectExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: number) => void;
  availableExercises: ExerciceMinimal[];
}



export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  availableExercises
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Handle smooth closing
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setSearchQuery('');
      onClose();
    }, 300);
  };

  // Handle exercise selection
  const handleSelectExercise = (exerciseId: number) => {
    onSelect(exerciseId);
    handleClose();
  };

  // Filter and sort exercises
  const filteredExercises = useMemo(() => {
    let filtered = availableExercises;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query)
      );
    }



    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableExercises, searchQuery]);

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
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
              <MagnifyingGlassIcon className="h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">Aucun exercice trouvé</p>
              <p className="text-sm">Essayez une autre recherche</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(exercise.id)}
                  className="w-full p-4 rounded-xl bg-[#121214] border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 hover:bg-[#1a1a1c] transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium group-hover:text-[#94fbdd] transition-colors">
                      {exercise.name}
                    </span>
                    <div className="w-6 h-6 rounded-full border-2 border-[#94fbdd]/30 group-hover:border-[#94fbdd] group-hover:bg-[#94fbdd]/20 transition-all flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-[#94fbdd] transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-[#94fbdd]/10">
          <p className="text-center text-gray-400 text-sm">
            {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''} disponible{filteredExercises.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
