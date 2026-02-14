import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ChevronLeftIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  TrashIcon,
  AdjustmentsVerticalIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCoachClients } from '../../api/hooks/coaching/useCoachClients';
import { useExercicesMinimal } from '../../api/hooks/exercice/useGetExercicesMinimal';
import { COACH_CLIENTS } from '../../utils/paths';
import { SelectExerciseModal } from '../../components/ui/modal/SelectExerciseModal';
import { useAssignSession } from '../../api/hooks/coaching/useAssignSession';
import { useSaveCoachSession } from '../../api/hooks/coaching/useSaveCoachSession';
import { useCoachSessions } from '../../api/hooks/coaching/useCoachSessions';
import { getImageUrl } from '../../utils/imageUtils';


interface SelectedExercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

type Step = 'LIST' | 'DESIGN' | 'ASSIGN';

export default function CoachSessionCreator() {
  const navigate = useNavigate();
  const { data: clients = [] } = useCoachClients();
  const { data: availableExercises = [] } = useExercicesMinimal();
  const { data: savedSessions = [], isLoading: isLoadingSessions } = useCoachSessions();
  const assignMutation = useAssignSession();
  const saveMutation = useSaveCoachSession();

  // Session State
  const [step, setStep] = useState<Step>('LIST');
  const [sessionName, setSessionName] = useState('');
  const [focus, setFocus] = useState('');
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  // Success tracking
  const [assignedResults, setAssignedResults] = useState<{ name: string, success: boolean }[]>([]);

  const handleSelectSession = (session: any) => {
    setSessionName(session.name);
    setFocus(session.description || '');
    setExercises(session.exercises.map((ex: any) => ({
      id: ex.exercise.id,
      name: ex.exercise.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight
    })));
    setStep('ASSIGN');
  };

  const handleCreateNew = () => {
    setSessionName('');
    setFocus('');
    setExercises([]);
    setStep('DESIGN');
  };

  const handleSaveDraft = async () => {
    if (!sessionName || exercises.length === 0) return;

    try {
      await saveMutation.mutateAsync({
        name: sessionName,
        description: focus,
        exercises: exercises.map(ex => ({
          id: ex.id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight
        }))
      });
      setStep('ASSIGN');
    } catch (err) {
      console.error('Failed to save session draft:', err);
      alert('Erreur lors de la sauvegarde de la séance.');
    }
  };

  const handleAssignToClients = async () => {
    if (selectedClients.length === 0) return;

    const results = [];
    for (const clientId of selectedClients) {
      const client = clients.find(c => c.id === clientId);
      try {
        await assignMutation.mutateAsync({
          clientId,
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
        results.push({ name: client?.name || 'Inconnu', success: true });
      } catch (err) {
        console.error(`Failed to assign to ${client?.name}:`, err);
        results.push({ name: client?.name || 'Inconnu', success: false });
      }
    }
    setAssignedResults(results);
    alert('Processus d\'assignation terminé.');
  };

  const toggleClient = (clientId: number) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
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

  const canContinue = sessionName.trim() !== '' && exercises.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#121214] pb-40">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-8 bg-gradient-to-b from-[#94fbdd]/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (step === 'ASSIGN') setStep('LIST');
              else if (step === 'DESIGN') setStep('LIST');
              else navigate(-1);
            }}
            className="p-2 rounded-xl bg-[#252527] text-white"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">
              {step === 'LIST' ? 'Ma Bibliothèque' : step === 'DESIGN' ? 'Créer une Séance' : 'Assigner la Séance'}
            </h1>
            <p className="text-[#94fbdd] text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
              {step === 'LIST' ? 'Tes modèles de séances' : step === 'DESIGN' ? 'Design de l\'entraînement' : 'Sélection des athlètes'}
            </p>
          </div>
        </div>

        {step === 'LIST' ? (
          <button
            onClick={handleCreateNew}
            className="w-10 h-10 rounded-xl bg-[#94fbdd] text-[#121214] flex items-center justify-center shadow-lg shadow-[#94fbdd]/20 active:scale-95 transition-all"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        ) : step === 'DESIGN' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252527] rounded-full border border-white/5">
            <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Brouillon</span>
          </div>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="px-6 flex-1">
        <AnimatePresence mode="wait">
          {step === 'LIST' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {isLoadingSessions ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white/5 animate-pulse rounded-3xl" />
                  ))}
                </div>
              ) : savedSessions.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <ClipboardDocumentIcon className="w-16 h-16 text-gray-800 mb-4" />
                  <p className="text-gray-500 font-bold">Aucune séance enregistrée</p>
                  <p className="text-gray-600 text-xs mt-2 text-center max-w-[200px]">
                    Crée tes modèles de séances pour les assigner rapidement à tes athlètes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="p-5 bg-[#252527] border border-white/5 rounded-3xl flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <h4 className="text-white font-black text-sm truncate uppercase tracking-tight">{session.name}</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase mt-0.5">
                          {session.exercises.length} exercices • {session.description || 'Sans focus'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectSession(session)}
                        className="px-4 py-2 bg-[#94fbdd] text-[#121214] rounded-full text-[10px] font-black uppercase active:scale-95 transition-all"
                      >
                        Assigner
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : step === 'DESIGN' ? (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8 pb-12"
            >
              {/* Session Meta */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#94fbdd]/20 flex items-center justify-center">
                    <ClipboardDocumentIcon className="w-4 h-4 text-[#94fbdd]" />
                  </div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Informations générales</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nom de la séance (ex: Full Body A)"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      className="w-full bg-[#252527] border border-white/5 rounded-2xl py-4 px-5 text-white outline-none focus:border-[#94fbdd]/30 transition-all font-bold placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Focus principal (ex: Hypertrophie / Force)"
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      className="w-full bg-[#252527] border border-white/5 rounded-2xl py-4 px-5 text-white outline-none focus:border-[#94fbdd]/30 transition-all font-bold placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </section>

              {/* Exercises */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#94fbdd]/20 flex items-center justify-center">
                      <AdjustmentsVerticalIcon className="w-4 h-4 text-[#94fbdd]" />
                    </div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Exercices ({exercises.length})</h3>
                  </div>
                  <button
                    onClick={() => setIsExerciseModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#94fbdd]/10 text-[#94fbdd] border border-[#94fbdd]/20 rounded-full text-[10px] font-black uppercase tracking-tighter active:scale-95 transition-all"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {exercises.map((ex, idx) => (
                    <motion.div
                      key={`${ex.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#252527] p-5 rounded-[2rem] border border-white/5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-white font-bold">{ex.name}</h4>
                        <button
                          onClick={() => removeExercise(idx)}
                          className="p-1 text-gray-600 hover:text-red-400"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#121214] p-3 rounded-2xl border border-white/5 text-center">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Séries</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updateExercise(idx, { sets: parseInt(e.target.value) || 0 })}
                            className="bg-transparent text-white font-black text-center w-full outline-none"
                          />
                        </div>
                        <div className="bg-[#121214] p-3 rounded-2xl border border-white/5 text-center">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Reps</label>
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => updateExercise(idx, { reps: parseInt(e.target.value) || 0 })}
                            className="bg-transparent text-white font-black text-center w-full outline-none"
                          />
                        </div>
                        <div className="bg-[#121214] p-3 rounded-2xl border border-white/5 text-center">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Charge</label>
                          <input
                            type="number"
                            value={ex.weight}
                            onChange={(e) => updateExercise(idx, { weight: parseFloat(e.target.value) || 0 })}
                            className="bg-transparent text-[#94fbdd] font-black text-center w-full outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {exercises.length === 0 && (
                    <div
                      onClick={() => setIsExerciseModalOpen(true)}
                      className="py-16 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center cursor-pointer hover:bg-white/5 transition-all"
                    >
                      <PlusIcon className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 font-bold text-sm">Design ta séance</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="assign"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Session Summary Card */}
              <div className="bg-gradient-to-br from-[#252527] to-[#1c1c1e] p-6 rounded-[2.5rem] border border-[#94fbdd]/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ClipboardDocumentIcon className="w-24 h-24 text-[#94fbdd]" />
                </div>
                <h2 className="text-xl font-black text-white mb-1">{sessionName}</h2>
                <p className="text-[#94fbdd] text-xs font-bold uppercase tracking-widest mb-4">{focus || 'Aucun focus'}</p>
                <div className="flex items-center gap-4">
                  <div className="bg-[#121214] px-4 py-2 rounded-xl text-xs text-white font-bold border border-white/5">
                    {exercises.length} exercices
                  </div>
                  <div className="bg-[#121214] px-4 py-2 rounded-xl text-xs text-white font-bold border border-white/5">
                    ~{exercises.reduce((acc, curr) => acc + curr.sets, 0)} séries
                  </div>
                </div>
              </div>

              {/* Client Selection */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#94fbdd]/20 flex items-center justify-center">
                      <UserGroupIcon className="w-4 h-4 text-[#94fbdd]" />
                    </div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Choisir les athlètes ({selectedClients.length})</h3>
                  </div>
                  <button
                    onClick={() => setSelectedClients(selectedClients.length === clients.length ? [] : clients.map(c => c.id))}
                    className="text-[10px] font-black text-[#94fbdd] uppercase tracking-widest"
                  >
                    {selectedClients.length === clients.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {clients.map(client => {
                    const isSelected = selectedClients.includes(client.id);
                    return (
                      <button
                        key={client.id}
                        onClick={() => toggleClient(client.id)}
                        className={`p-4 rounded-[2rem] border flex items-center gap-3 transition-all ${isSelected ? 'bg-[#94fbdd]/10 border-[#94fbdd] text-white' : 'bg-[#252527] border-white/5 text-gray-500'}`}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#121214] border border-white/5 flex-shrink-0">
                          {client.profilePictureUrl ? (
                            <img src={getImageUrl(client.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold">{client.name[0]}</div>
                          )}
                        </div>
                        <span className="text-xs font-black truncate flex-1 text-left">{client.name}</span>
                        {isSelected && <CheckCircleIcon className="w-5 h-5 text-[#94fbdd]" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Assignment Summary / Feedback */}
              {assignedResults.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#121214] rounded-3xl p-6 border border-white/5">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Statut d'assignation</h4>
                  <div className="space-y-2">
                    {assignedResults.map((res, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white font-bold">{res.name}</span>
                        <span className={res.success ? 'text-[#94fbdd]' : 'text-red-400'}>{res.success ? 'Assigné ✓' : 'Échec ✗'}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      {step !== 'LIST' && (
        <footer className="fixed bottom-20 inset-x-0 p-6 bg-gradient-to-t from-[#121214] to-transparent z-10">
          <div className="max-w-md mx-auto">
            {step === 'DESIGN' ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={!canContinue || saveMutation.isPending}
                onClick={handleSaveDraft}
                className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${canContinue && !saveMutation.isPending ? 'bg-[#94fbdd] text-[#121214]' : 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed'}`}
              >
                {saveMutation.isPending ? 'Sauvegarde...' : 'Créer la séance'}
                <CheckIcon className="w-4 h-4" />
              </motion.button>
            ) : assignedResults.length > 0 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(COACH_CLIENTS)}
                className="w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-[#94fbdd] text-[#121214]"
              >
                Terminer
                <CheckCircleIcon className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={selectedClients.length === 0 || assignMutation.isPending}
                onClick={handleAssignToClients}
                className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${selectedClients.length > 0 && !assignMutation.isPending ? 'bg-[#94fbdd] text-[#121214]' : 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed'}`}
              >
                {assignMutation.isPending ? 'Assignation...' : `Assigner à ${selectedClients.length} athlète${selectedClients.length > 1 ? 's' : ''}`}
                <UserGroupIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </footer>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      <SelectExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSelect={addExercise}
        availableExercises={availableExercises}
      />
    </div>
  );
}
