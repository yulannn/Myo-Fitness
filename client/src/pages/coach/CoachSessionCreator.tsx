import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ChevronLeftIcon,
  ClipboardDocumentIcon,
  UserIcon,
  TrashIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';
import { useCoachClients } from '../../api/hooks/coaching/useCoachClients';
import { useExercicesMinimal } from '../../api/hooks/exercice/useGetExercicesMinimal';
import { SelectExerciseModal } from '../../components/ui/modal/SelectExerciseModal';
import { useAssignSession } from '../../api/hooks/coaching/useAssignSession';


interface SelectedExercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function CoachSessionCreator() {
  const navigate = useNavigate();
  const { data: clients = [] } = useCoachClients();
  const { data: availableExercises = [] } = useExercicesMinimal();
  const assignMutation = useAssignSession();

  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [focus, setFocus] = useState('');
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  const handleCreate = async () => {
    if (!selectedClient || !sessionName) return;

    try {
      await assignMutation.mutateAsync({
        clientId: selectedClient,
        sessionData: {
          name: sessionName,
          exercises: exercises.map(ex => ({
            id: ex.id,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight
          }))
        }
      });
      alert('Séance assignée avec succès !');
      navigate(-1);
    } catch (err) {
      console.error('Failed to assign session:', err);
      alert('Erreur lors de l’assignation de la séance.');
    }
  };

  const addExercise = (exerciseId: number) => {
    const exercise = availableExercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      setExercises([...exercises, {
        id: exercise.id,
        name: exercise.name,
        sets: 3,
        reps: 10,
        weight: 0
      }]);
    }
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, fields: Partial<SelectedExercise>) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], ...fields };
    setExercises(newExercises);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121214] pb-32">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-8 bg-gradient-to-b from-[#94fbdd]/10 to-transparent flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-[#252527] text-white"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Nouvelle Séance</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Assignation Client</p>
        </div>
      </header>

      {/* ── Form ───────────────────────────────────────────── */}
      <div className="px-6 space-y-10 flex-1">

        {/* Step 1: Client Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-[#94fbdd]/20 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-[#94fbdd]" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">1. Choisir l'athlète</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client.id)}
                className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${selectedClient === client.id ? 'bg-[#94fbdd]/10 border-[#94fbdd] ring-1 ring-[#94fbdd]' : 'bg-[#252527] border-white/5 opacity-50'}`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800">
                  {client.profilePictureUrl ? (
                    <img src={client.profilePictureUrl} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">{client.name[0]}</div>
                  )}
                </div>
                <span className={`text-[10px] font-bold ${selectedClient === client.id ? 'text-[#94fbdd]' : 'text-gray-400'}`}>
                  {client.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Session Details */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-[#94fbdd]/20 flex items-center justify-center">
              <ClipboardDocumentIcon className="w-4 h-4 text-[#94fbdd]" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">2. Détails de la séance</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Nom de la séance</label>
              <input
                type="text"
                placeholder="Ex: Push Day / Explosivité"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full bg-[#252527] border border-white/5 rounded-2xl py-4 px-5 text-white outline-none focus:border-[#94fbdd]/30 transition-all font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Focus principal</label>
              <input
                type="text"
                placeholder="Ex: Pecs / Triceps"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full bg-[#252527] border border-white/5 rounded-2xl py-4 px-5 text-white outline-none focus:border-[#94fbdd]/30 transition-all font-bold"
              />
            </div>
          </div>
        </section>

        {/* Step 3: Exercises List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#94fbdd]/20 flex items-center justify-center">
                <AdjustmentsVerticalIcon className="w-4 h-4 text-[#94fbdd]" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">3. Exercices ({exercises.length})</h3>
            </div>
            <button
              onClick={() => setIsExerciseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#94fbdd] text-[#121214] rounded-full text-[10px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-lg shadow-[#94fbdd]/10"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode='popLayout'>
              {exercises.map((ex, idx) => (
                <motion.div
                  key={`${ex.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#252527] p-4 rounded-3xl border border-white/5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-white font-bold">{ex.name}</h4>
                    <button
                      onClick={() => removeExercise(idx)}
                      className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1 ml-1 text-center">Séries</label>
                      <div className="flex items-center bg-[#1c1c1e] rounded-xl border border-white/5">
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(idx, { sets: parseInt(e.target.value) || 0 })}
                          className="w-full bg-transparent py-2 text-center text-white font-black text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1 ml-1 text-center">Reps</label>
                      <div className="flex items-center bg-[#1c1c1e] rounded-xl border border-white/5">
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => updateExercise(idx, { reps: parseInt(e.target.value) || 0 })}
                          className="w-full bg-transparent py-2 text-center text-white font-black text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1 ml-1 text-center">Charge (kg)</label>
                      <div className="flex items-center bg-[#1c1c1e] rounded-xl border border-white/5">
                        <input
                          type="number"
                          value={ex.weight}
                          onChange={(e) => updateExercise(idx, { weight: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-transparent py-2 text-center text-white font-black text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {exercises.length === 0 && (
              <div
                onClick={() => setIsExerciseModalOpen(true)}
                className="bg-[#252527]/30 border-2 border-dashed border-white/5 rounded-3xl p-10 text-center cursor-pointer hover:bg-[#252527]/50 transition-all group"
              >
                <div className="w-12 h-12 bg-[#252527] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <PlusIcon className="w-6 h-6 text-gray-600 group-hover:text-[#94fbdd]" />
                </div>
                <p className="text-gray-500 font-bold text-sm">Commence par ajouter des exercices</p>
                <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest mt-1">Clique ici pour ouvrir la bibliothèque</p>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* ── Footer Action ──────────────────────────────────── */}
      <footer className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#121214] via-[#121214] to-transparent">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          disabled={!selectedClient || !sessionName || exercises.length === 0 || assignMutation.isPending}
          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#94fbdd]/10 ${(!selectedClient || !sessionName || exercises.length === 0 || assignMutation.isPending) ? 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed' : 'bg-[#94fbdd] text-[#121214]'}`}
        >
          {assignMutation.isPending ? 'Envoi en cours...' : 'Assigner la séance'}
        </motion.button>
      </footer>

      {/* ── Exercise Picker Modal ────────────────────────────── */}
      <SelectExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSelect={addExercise}
        availableExercises={availableExercises}
      />
    </div>
  );
}
