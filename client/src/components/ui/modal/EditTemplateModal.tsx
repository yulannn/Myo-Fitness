import { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import sessionTemplateService from '../../../api/services/sessionTemplateService';
import { SelectExerciseModal } from './SelectExerciseModal';

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  availableExercises: ExerciceMinimal[];
}

interface ExerciseRow {
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  orderInSession?: number;
}

export const EditTemplateModal = ({ isOpen, onClose, template, availableExercises }: EditTemplateModalProps) => {
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [isSelectingExercise, setIsSelectingExercise] = useState(false);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const queryClient = useQueryClient();

  // Animation state (only closing)
  const [isClosing, setIsClosing] = useState(false);

  // Swipe to dismiss
  const [dragStartY, setDragStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle smooth closing animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Initialize from template
  useEffect(() => {
    console.log('Template reçu:', template);

    if (template?.exercises) {
      console.log('Premier exercice brut:', template.exercises[0]);

      const mappedExercises: ExerciseRow[] = template.exercises.map((ex: any, index: number) => ({
        exerciseId: ex.exercise?.id, // ✅ Corriger: utiliser ex.exercise.id
        exerciseName: ex.exercise?.name || `Exercice #${ex.exercise?.id}`,
        sets: Math.max(ex.sets || 3, 1), // Minimum 1
        reps: Math.max(ex.reps || 10, 1), // Minimum 1
        weight: ex.weight || 0,
        orderInSession: index,
      }));

      console.log('Exercices après mapping:', mappedExercises);
      setExercises(mappedExercises);
    }
    setTemplateName(template?.name || '');
    setTemplateDescription(template?.description || '');
  }, [template, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Log des exercices pour debug
      console.log('Exercices avant validation:', exercises);

      // Validation des exercices
      for (const ex of exercises) {
        console.log(`Validation ${ex.exerciseName}:`, { exerciseId: ex.exerciseId, sets: ex.sets, reps: ex.reps, typeSets: typeof ex.sets, typeReps: typeof ex.reps });

        if (!ex.exerciseId || ex.sets < 1 || ex.reps < 1) {
          throw new Error(`L'exercice "${ex.exerciseName}" a des valeurs invalides. Séries: ${ex.sets}, Reps: ${ex.reps}. Séries et reps doivent être >= 1.`);
        }
      }

      // Préparer les données
      const payload = {
        name: templateName.trim() || template.name, // Garder l'ancien nom si vide
        description: templateDescription.trim(),
        exercises: exercises.map((ex, index) => ({
          exerciseId: Number(ex.exerciseId),
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          weight: ex.weight ? Number(ex.weight) : undefined,
          orderInSession: index,
        })),
      };

      console.log('Envoi au backend:', payload);

      await sessionTemplateService.updateTemplate(template.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program'] });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error saving template:', error);
      const message = error.message || 'Erreur lors de la sauvegarde du template';
      alert(message);
    },
  });

  const handleSelectExercise = (exerciseIdNumber: number) => {
    const exercise = availableExercises.find(ex => ex.id === exerciseIdNumber);

    if (!exercise) return;

    if (exercises.some(ex => ex.exerciseId === exerciseIdNumber)) {
      alert('Cet exercice est déjà dans le template');
      return;
    }

    const newExercise: ExerciseRow = {
      exerciseId: exerciseIdNumber,
      exerciseName: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      orderInSession: exercises.length,
    };

    setExercises([...exercises, newExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: 'sets' | 'reps' | 'weight', value: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setExercises(updatedExercises);
  };

  const handleSaveAll = () => {
    saveMutation.mutate();
  };

  const filteredExercises = availableExercises.filter(
    ex => !exercises.some(sessionEx => sessionEx.exerciseId === ex.id)
  );

  // Handle drag on header
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
  };

  const handleHeaderTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientY: number) => {
      const deltaY = clientY - dragStartY;
      if (deltaY > 0 && modalRef.current) {
        modalRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleEnd = () => {
      if (!modalRef.current) return;

      const transform = modalRef.current.style.transform;
      const match = transform.match(/translateY\((\d+)px\)/);
      const deltaY = match ? parseInt(match[1]) : 0;

      if (deltaY > 100) {
        handleClose();
      } else {
        modalRef.current.style.transform = '';
      }
      setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStartY]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`relative z-[100] w-full h-[92vh] bg-[#252527] rounded-t-3xl shadow-2xl border-t border-x border-[#94fbdd]/10 flex flex-col transition-all duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
      >
        {/* Draggable Header */}
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing px-6 pt-6 pb-4"
          onMouseDown={handleHeaderMouseDown}
          onTouchStart={handleHeaderTouchStart}
        >
          {/* Drag Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center">
            Modifier le template
          </h2>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="space-y-4">
            {/* Template Name*/}
            <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-[#94fbdd]" />
                <h4 className="text-white font-semibold">Nom du template</h4>
              </div>
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nom du template... (ex: Push Day, Jour A, etc.)"
                className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all"
              />
            </div>

            {/* Template Description */}
            <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3">
              <h4 className="text-white font-semibold">Description (optionnel)</h4>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Description du template..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 resize-none transition-all"
              />
            </div>

            {/* Add Exercise Button */}
            <button
              onClick={() => setIsSelectingExercise(true)}
              disabled={filteredExercises.length === 0}
              className="w-full p-4 rounded-xl bg-[#121214] border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 hover:bg-[#1a1a1c] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-5 w-5 text-[#94fbdd]" />
              <span className="font-medium text-white">
                {filteredExercises.length === 0 ? 'Tous les exercices sont déjà ajoutés' : 'Ajouter un exercice'}
              </span>
            </button>

            {/* Exercises List */}
            {exercises.map((exercise, index) => (
              <div
                key={`${exercise.exerciseId}-${index}`}
                className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-white font-semibold flex-1 break-words">
                    {exercise.exerciseName}
                  </h4>
                  <button
                    onClick={() => handleRemoveExercise(index)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Supprimer l'exercice"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Séries</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets === 0 ? '' : exercise.sets}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleUpdateExercise(index, 'sets', value === '' ? 1 : Number(value));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Reps</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.reps === 0 ? '' : exercise.reps}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleUpdateExercise(index, 'reps', value === '' ? 1 : Number(value));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Poids (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.weight === 0 || exercise.weight === undefined ? '' : exercise.weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleUpdateExercise(index, 'weight', value === '' ? 0 : Number(value));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                    />
                  </div>
                </div>
              </div>
            ))}

            {exercises.length === 0 && (
              <p className="text-center text-gray-500 py-8 italic">
                Aucun exercice dans ce template
              </p>
            )}
          </div>
          {/* Aesthetic Divider */}
          <div className="flex items-center gap-3 py-4 pt-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#94fbdd]/20 to-transparent"></div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#94fbdd]/30"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#94fbdd]/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#94fbdd]/30"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#94fbdd]/20 to-transparent"></div>
          </div>
        </div>

        {/* SelectExerciseModal */}
        <SelectExerciseModal
          isOpen={isSelectingExercise}
          onClose={() => setIsSelectingExercise(false)}
          onSelect={handleSelectExercise}
          availableExercises={filteredExercises}
        />

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              disabled={saveMutation.isPending}
              className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saveMutation.isPending}
              className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121214] border-t-transparent" />
                  <span>Enregistrement...</span>
                </div>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
