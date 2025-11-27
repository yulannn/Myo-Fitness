import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayIcon, StopIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import useCreatePerformance from '../../api/hooks/performance/useCreatePerformance'
import useUpdateCompletedSession from '../../api/hooks/session/useUpdateCompletedSession'
import useCreateAdaptedSession from '../../api/hooks/session-adaptation/useCreateAdaptedSession'
import useCreateNewSimilarSession from '../../api/hooks/session-adaptation/useCreateNewSimilarSession'
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../../components/ui/modal'
import Button from '../../components/ui/button/Button'

export default function ActiveSession() {
    const navigate = useNavigate()
    const [activeSession, setActiveSession] = useState<any>(null)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [performances, setPerformances] = useState<Record<string, any>>({})
    const [savedPerformances, setSavedPerformances] = useState<Set<string>>(new Set())
    const [showGenerationModal, setShowGenerationModal] = useState(false)

    const { mutate: createPerformance } = useCreatePerformance()
    const { mutate: updateCompletedSession } = useUpdateCompletedSession()
    const { mutate: createAdaptedSession, isPending: isAdaptingSession } = useCreateAdaptedSession()
    const { mutate: createSimilarSession, isPending: isCreatingSimilar } = useCreateNewSimilarSession()

    useEffect(() => {
        const savedSession = localStorage.getItem('activeSession')
        const savedStartTime = localStorage.getItem('sessionStartTime')
        if (savedSession) {
            setActiveSession(JSON.parse(savedSession))
        }

        if (savedStartTime) {
            setStartTime(parseInt(savedStartTime))
        }
    }, [])

    useEffect(() => {
        if (startTime) {
            const interval = setInterval(() => {
                setElapsedTime(Date.now() - startTime)
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [startTime])

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // Calculer le nombre total de séries et combien sont validées
    const totalSets = useMemo(() => {
        if (!activeSession?.exercices) return 0
        return activeSession.exercices.reduce((total: number, ex: any) => total + ex.sets, 0)
    }, [activeSession])

    const validatedSets = useMemo(() => {
        return Object.values(performances).filter((perf: any) => perf.success === true).length
    }, [performances])

    const allSetsValidated = totalSets > 0 && validatedSets === totalSets

    const handleStopSession = () => {
        if (activeSession?.id) {
            updateCompletedSession(activeSession.id, {
                onSuccess: () => {
                    setShowGenerationModal(true)
                },
                onError: (error) => {
                    console.error('Erreur lors de la complétion de la session:', error)
                    alert('Erreur lors de la finalisation de la séance. Veuillez réessayer.')
                }
            })
        }
    }

    const handleGenerateAdaptedSession = () => {
        if (!activeSession?.id) return

        createAdaptedSession(activeSession.id, {
            onSuccess: () => {
                setShowGenerationModal(false)
                localStorage.removeItem('activeSession')
                localStorage.removeItem('sessionStartTime')
                navigate('/programs')
            },
            onError: (error) => {
                console.error('Erreur création session adaptée:', error)
                alert('Erreur lors de la génération. Peut-être pas assez de données de performance.')
                setShowGenerationModal(false)
                localStorage.removeItem('activeSession')
                localStorage.removeItem('sessionStartTime')
                navigate('/programs')
            }
        })
    }

    const handleGenerateSimilarSession = () => {
        if (!activeSession?.id) return

        createSimilarSession(activeSession.id, {
            onSuccess: () => {
                setShowGenerationModal(false)
                localStorage.removeItem('activeSession')
                localStorage.removeItem('sessionStartTime')
                navigate('/programs')
            },
            onError: (error) => {
                console.error('Erreur création session similaire:', error)
                alert('Erreur lors de la génération de la session.')
                setShowGenerationModal(false)
                localStorage.removeItem('activeSession')
                localStorage.removeItem('sessionStartTime')
                navigate('/programs')
            }
        })
    }

    const handlePerformanceChange = (
        exerciceSessionId: number,
        setIndex: number,
        field: 'reps_effectuees' | 'weight' | 'rpe',
        value: any
    ) => {
        const key = `${exerciceSessionId}-${setIndex}`
        setPerformances(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                exerciceSessionId: exerciceSessionId,
                [field]: value,
            }
        }))
    }

    const handleValidateSet = (exerciceSessionId: number, setIndex: number) => {
        const key = `${exerciceSessionId}-${setIndex}`
        const perf = performances[key]
        const newSuccessState = !(perf?.success)

        // Mettre à jour l'état de validation
        setPerformances(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                exerciceSessionId: exerciceSessionId,
                success: newSuccessState,
            }
        }))

        // Sauvegarder si on valide et pas déjà sauvegardé
        if (newSuccessState && !savedPerformances.has(key)) {
            const updatedPerf = { ...perf, success: newSuccessState }

            if (!updatedPerf.reps_effectuees && !updatedPerf.weight) {
                alert('Veuillez entrer au moins les répétitions ou le poids.')
                setPerformances(prev => ({
                    ...prev,
                    [key]: { ...(prev[key] || {}), success: false }
                }))
                return
            }

            const payload = {
                exerciceSessionId: exerciceSessionId,
                reps_effectuees: updatedPerf.reps_effectuees || 0,
                weight: updatedPerf.weight || 0,
                rpe: updatedPerf.rpe
            }

            setSavedPerformances(prev => new Set(prev).add(key))

            createPerformance(payload, {
                onSuccess: () => {
                    console.log('✅ Performance sauvegardée:', key)
                },
                onError: (error) => {
                    console.error('❌ Erreur:', error)
                    alert('Erreur lors de la sauvegarde.')
                    setSavedPerformances(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(key)
                        return newSet
                    })
                    setPerformances(prev => ({
                        ...prev,
                        [key]: { ...(prev[key] || {}), success: false }
                    }))
                }
            })
        }
    }

    if (!activeSession) {
        return (
            <section className="flex flex-col items-center justify-center min-h-[80vh] p-6">
                <div className="text-center space-y-4">
                    <PlayIcon className="h-24 w-24 text-[#7CD8EE]/30 mx-auto" />
                    <h1 className="text-2xl font-bold text-[#2F4858]">Aucune séance active</h1>
                    <p className="text-[#2F4858]/60">
                        Démarrez une séance depuis la page Programmes pour commencer votre entraînement
                    </p>
                    <button
                        onClick={() => navigate('/programs')}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        Aller aux Programmes
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="space-y-6 pb-24 p-4">
            {/* Header avec chrono */}
            <div className="bg-gradient-to-br from-[#7CD8EE] to-[#2F4858] rounded-3xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Séance en cours</h1>
                        <p className="text-white/80 text-sm mt-1">{activeSession.trainingProgram?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                        <PlayIcon className="h-5 w-5 animate-pulse" />
                        <span className="text-sm font-medium">EN COURS</span>
                    </div>
                </div>

                {/* Chronomètre */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
                    <p className="text-sm text-white/70 mb-2">Durée de la séance</p>
                    <p className="text-5xl font-bold font-mono tracking-wider">{formatTime(elapsedTime)}</p>
                </div>
            </div>

            {/* Notes de session */}
            {activeSession.notes && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                    <p className="text-sm text-blue-700 font-medium">{activeSession.notes}</p>
                </div>
            )}

            {/* Liste des exercices */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#2F4858] px-2">Exercices</h2>

                {activeSession.exercices?.map((exerciceSession: any, index: number) => (
                    <div
                        key={exerciceSession.id || index}
                        className="bg-white rounded-2xl shadow-md border-2 border-[#7CD8EE]/20 p-5"
                    >
                        {/* Header exercice */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-[#2F4858]">
                                {exerciceSession.exercice?.name || `Exercice ${index + 1}`}
                            </h3>
                            <p className="text-sm text-[#2F4858]/60 mt-1">
                                {exerciceSession.sets} séries × {exerciceSession.reps} reps
                                {exerciceSession.weight && ` • ${exerciceSession.weight} kg`}
                            </p>
                        </div>

                        {/* Grille des séries */}
                        <div className="space-y-3">
                            {Array.from({ length: exerciceSession.sets }).map((_, setIndex) => {
                                const perfKey = `${exerciceSession.id}-${setIndex}`
                                const perf = performances[perfKey] || {}

                                return (
                                    <div
                                        key={setIndex}
                                        className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Numéro de série */}
                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#7CD8EE] to-[#2F4858] rounded-xl flex items-center justify-center text-white font-bold">
                                                {setIndex + 1}
                                            </div>

                                            {/* Inputs de performance */}
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                {/* Reps effectuées */}
                                                <div>
                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                        Reps réalisées
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder={exerciceSession.reps.toString()}
                                                        value={perf.reps_effectuees || ''}
                                                        onChange={(e) =>
                                                            handlePerformanceChange(
                                                                exerciceSession.id,
                                                                setIndex,
                                                                'reps_effectuees',
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border-2 border-[#7CD8EE]/30 rounded-lg focus:border-[#7CD8EE] focus:outline-none text-center font-semibold"
                                                    />
                                                </div>

                                                {/* Poids utilisé */}
                                                <div>
                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                        Poids (kg)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        placeholder={exerciceSession.weight?.toString() || '0'}
                                                        value={perf.weight || ''}
                                                        onChange={(e) =>
                                                            handlePerformanceChange(
                                                                exerciceSession.id,
                                                                setIndex,
                                                                'weight',
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border-2 border-[#7CD8EE]/30 rounded-lg focus:border-[#7CD8EE] focus:outline-none text-center font-semibold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Bouton de validation */}
                                            <button
                                                onClick={() => handleValidateSet(exerciceSession.id, setIndex)}
                                                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${perf.success
                                                    ? 'bg-green-500 shadow-lg'
                                                    : 'bg-gray-200 hover:bg-green-100'
                                                    }`}
                                            >
                                                <CheckCircleIcon
                                                    className={`h-6 w-6 ${perf.success ? 'text-white' : 'text-gray-400'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bouton Terminer la séance */}
            <div className="fixed bottom-24 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
                <button
                    onClick={handleStopSession}
                    disabled={!allSetsValidated}
                    className={`w-full font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 ${allSetsValidated
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <StopIcon className="h-6 w-6" />
                    {allSetsValidated ? 'Terminer la séance' : `Validez toutes les séries (${validatedSets}/${totalSets})`}
                </button>
            </div>

            {/* Modale de génération de la prochaine session */}
            <Modal isOpen={showGenerationModal} onClose={() => { }}>
                <ModalHeader>
                    <ModalTitle>Générer la prochaine séance</ModalTitle>
                </ModalHeader>
                <div className="px-6 py-4 space-y-4">
                    <p className="text-[#2F4858]/80">
                        Félicitations pour avoir terminé votre séance ! 🎉
                    </p>
                    <p className="text-[#2F4858]/80">
                        Voulez-vous générer automatiquement votre prochaine séance ?
                    </p>
                    <div className="space-y-3 mt-4">
                        <div className="bg-[#7CD8EE]/10 p-4 rounded-xl border border-[#7CD8EE]/30">
                            <h4 className="font-semibold text-[#2F4858] mb-2">✨ Session adaptée</h4>
                            <p className="text-sm text-[#2F4858]/70">
                                La prochaine séance sera ajustée selon vos performances pour optimiser votre progression.
                            </p>
                        </div>
                        <div className="bg-[#2F4858]/10 p-4 rounded-xl border border-[#2F4858]/30">
                            <h4 className="font-semibold text-[#2F4858] mb-2">🔁 Session similaire</h4>
                            <p className="text-sm text-[#2F4858]/70">
                                La prochaine séance reprendra exactement les mêmes paramètres.
                            </p>
                        </div>
                    </div>
                </div>
                <ModalFooter>
                    <div className="flex flex-col gap-3 w-full">
                        <Button
                            variant="primary"
                            onClick={handleGenerateAdaptedSession}
                            disabled={isAdaptingSession || isCreatingSimilar}
                        >
                            {isAdaptingSession ? 'Génération...' : '✨ Adapter selon performances'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleGenerateSimilarSession}
                            disabled={isAdaptingSession || isCreatingSimilar}
                        >
                            {isCreatingSimilar ? 'Génération...' : '🔁 Garder la même séance'}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </section>
    )
}
