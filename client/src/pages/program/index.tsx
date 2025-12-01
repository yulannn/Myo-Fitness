import { useProgramsByUser } from '../../api/hooks/program/useGetProgramsByUser';
import useCreateProgram from '../../api/hooks/program/useCreateProgram';
import useCreateManualProgram from '../../api/hooks/program/useCreateManualProgram';
import useExercicesByUser from '../../api/hooks/exercice/useGetExercicesByUser';
import { useState, useMemo, useRef } from 'react';
import {
  Modal,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '../../components/ui/modal';
import { ManualProgramModal } from '../../components/ui/modal/ManualProgramModal';
import Button from '../../components/ui/button/Button';
import { Badge } from '../../components/ui/badge';
import useFitnessProfilesByUser from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser';
import { useAuth } from '../../context/AuthContext';
import { SessionCard } from '../../components/ui/session';

const Program = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [automaticOpen, setAutomaticOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: fitnessProfile } = useFitnessProfilesByUser();
  const { data, isLoading } = useProgramsByUser();
  const { data: exercices = [] } = useExercicesByUser();
  const { mutate, isPending } = useCreateProgram();
  const { mutate: mutateManual } = useCreateManualProgram();

  const programs = Array.isArray(data) ? data : [];
  const hasActiveProgram = useMemo(
    () => programs.some((p: any) => p.status === 'ACTIVE'),
    [programs],
  );

  const automaticProgramNameRef = useRef<string>('');
  const automaticProgramDescriptionRef = useRef<string>('');

  const { user } = useAuth();

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

  // Fonction pour trier les sessions : sans date en premier, puis par date croissante
  const sortSessions = (sessions: any[]) => {
    if (!sessions || !Array.isArray(sessions)) return [];

    return [...sessions].sort((a, b) => {
      // Sessions sans date viennent en premier
      if (!a.date && !b.date) return 0;
      if (!a.date) return -1;
      if (!b.date) return 1;

      // Ensuite trier par date (la plus proche en premier)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col w-full h-full pb-8 space-y-6">
      <h1 className="text-2xl p-2">PROGRAMME D'ENTRAÎNEMENT</h1>
      <div className="flex justify-end">
        <Button onClick={openAddFlow} variant="primary" size="md">
          Ajouter un programme
        </Button>
      </div>

      {(Array.isArray(data) ? data : []).map((program: any) => (
        <section
          key={program.id ?? `program-${program.name}`}
          className="bg-white shadow rounded p-4"
        >
          <header className="mb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{program.name}</h2>
              {program.status === 'ACTIVE' ? (
                <Badge className="badge badge-success">{program.status}</Badge>
              ) : (
                <Badge className="badge badge-secondary">
                  {program.status}
                </Badge>
              )}
            </div>
            {program.description && (
              <p className="text-sm text-gray-600">{program.description}</p>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Créé le:{' '}
              {program.createdAt
                ? new Date(program.createdAt).toLocaleString()
                : '—'}
            </div>
          </header>

          <div className="mt-3 space-y-3 pb-12">
            {sortSessions(program.sessions).map((session: any) => (
              <SessionCard
                key={session.id ?? `session-${program.id}-${session.date}`}
                session={session}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Confirmation Modal for Active Program */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <ModalHeader>
          <ModalTitle>Attention vous avez deja un programme actif !</ModalTitle>
        </ModalHeader>
        <div className="px-2 text-sm text-gray-700 m-auto">
          Si vous continuez, le programme actuel sera archivé et remplacé par le
          nouveau.
        </div>
        <ModalFooter>
          <div className="flex justify-end gap-3 m-auto">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleConfirmContinue}>
              Continuer
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Choice Modal - Manual or Automatic */}
      <Modal isOpen={choiceOpen} onClose={() => setChoiceOpen(false)}>
        <ModalHeader>
          <ModalTitle>Créer un programme</ModalTitle>
        </ModalHeader>

        <ModalFooter>
          <div className="flex justify-end gap-3 m-auto">
            <Button variant="ghost" onClick={handleCreateManual}>
              Créer manuellement
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setAutomaticOpen(true);
                setChoiceOpen(false);
              }}
              disabled={isPending}
            >
              {isPending ? 'Création...' : 'Générer automatiquement'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Automatic Program Modal */}
      <Modal
        isOpen={automaticOpen}
        onClose={() => {
          setAutomaticOpen(false);
          setSelectedProfileId('');
        }}
      >
        <ModalHeader>
          <ModalTitle>Personnalisez votre programme</ModalTitle>
        </ModalHeader>
        <div className="px-2 text-sm text-gray-700 space-y-4">
          <div className="flex flex-col">
            <label htmlFor="program-name" className="mb-1 font-medium">
              Nom du programme
            </label>
            <input
              id="program-name"
              type="text"
              className="border rounded px-3 py-2"
              placeholder="Programme généré"
              onChange={(e) =>
                (automaticProgramNameRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="program-description" className="mb-1 font-medium">
              Description du programme
            </label>
            <textarea
              id="program-description"
              className="border rounded px-3 py-2"
              placeholder="Programme généré automatiquement"
              onChange={(e) =>
                (automaticProgramDescriptionRef.current = e.target.value)
              }
              disabled={isGenerating}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium">Fitness Profil</label>

            <select
              className="border rounded px-3 py-2"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              disabled={isGenerating}
              required
            >
              <option value="" disabled>
                Choisissez votre profil
              </option>

              {fitnessProfile && (
                <option value={fitnessProfile.id}>
                  {user?.name} – {fitnessProfile.age} ans –{' '}
                  {fitnessProfile.weight} kg – {fitnessProfile.height} cm
                </option>
              )}
            </select>
            {selectionError && (
              <p className="text-xs text-red-600 mt-2">{selectionError}</p>
            )}
          </div>

          {isGenerating && (
            <div className="mt-3 flex items-center gap-3">
              <div
                className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"
                aria-hidden
              />
              <p className="text-xs text-gray-500">Génération en cours…</p>
            </div>
          )}
        </div>

        <ModalFooter>
          <div className="flex justify-end gap-3 m-auto">
            <Button
              variant="secondary"
              onClick={() => {
                setAutomaticOpen(false);
                setSelectedProfileId('');
              }}
              disabled={isGenerating}
            >
              Fermer
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                handleConfirmAutomatic(
                  automaticProgramNameRef.current,
                  automaticProgramDescriptionRef.current,
                )
              }
              disabled={isGenerating || !selectedProfileId}
            >
              {isGenerating ? 'Génération…' : 'Confirmer'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Manual Program Modal */}
      {fitnessProfile && (
        <ManualProgramModal
          isOpen={manualOpen}
          onClose={() => setManualOpen(false)}
          availableExercises={exercices}
          fitnessProfileId={fitnessProfile.id}
          onConfirm={handleManualProgramConfirm}
        />
      )}
    </div>
  );
};

export default Program;
