import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayIcon, StopIcon, CheckCircleIcon, XMarkIcon, SparklesIcon, ArrowPathIcon, MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/solid'
import useCreatePerformance from '../../api/hooks/performance/useCreatePerformance'
import useDeletePerformance from '../../api/hooks/performance/useDeletePerformance'
import useUpdateCompletedSession from '../../api/hooks/session/useUpdateCompletedSession'
import useDeleteSession from '../../api/hooks/session/useDeleteSession'
import useCreateAdaptedSession from '../../api/hooks/session-adaptation/useCreateAdaptedSession'
import useCreateNewSimilarSession from '../../api/hooks/session-adaptation/useCreateNewSimilarSession'
import useUpdateExerciceSets from '../../api/hooks/session/useUpdateExerciceSets'
import { Modal } from '../../components/ui/modal'
import { usePerformanceStore } from '../../store/usePerformanceStore'
import SessionSummaryCard from '../../components/session/SessionSummaryCard'
import { getExerciseImageUrl } from '../../utils/imageUtils'

export default function ActiveSession() {
    const navigate = useNavigate()
    const [elapsedTime, setElapsedTime] = useState(0)
    const [finalDuration, setFinalDuration] = useState(0)
    const [showGenerationModal, setShowGenerationModal] = useState(false)
    const [showSummaryCard, setShowSummaryCard] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    // Zustand store unifié - Plus de localStorage manuel !
    const {
        performances,
        activeSession,
        startTime,
        updatePerformance,
        toggleSuccess,
        markAsSaved,
        clearSession,
        getAllPerformances,
    } = usePerformanceStore()


    const { mutate: createPerformance } = useCreatePerformance()
    const { mutate: deletePerformance } = useDeletePerformance()
    const { mutate: updateCompletedSession } = useUpdateCompletedSession()
    const { mutate: createAdaptedSession, isPending: isAdaptingSession } = useCreateAdaptedSession()
    const { mutate: createSimilarSession, isPending: isCreatingSimilar } = useCreateNewSimilarSession()
    const { mutate: deleteSession } = useDeleteSession()
    const { mutate: updateExerciceSets, isPending: isUpdatingSets } = useUpdateExerciceSets()


    // Plus besoin de charger depuis localStorage - Le store Zustand gère toute la persistance !

    // Chronomètre
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

    // Compter combien de séries sont validées pour un exercice donné
    const getValidatedSetsCount = (exerciceSessionId: number) => {
        return Object.values(performances).filter(
            (perf: any) => perf.exerciceSessionId === exerciceSessionId && perf.success === true
        ).length
    }

    const allSetsValidated = totalSets > 0 && validatedSets === totalSets

    // Helper pour nettoyer complètement la session
    const cleanupSession = () => {
        clearSession() // Nettoie tout le store Zustand (performances + activeSession + startTime)
    }



    // Demander confirmation avant de terminer la session
    const handleRequestStopSession = () => {
        setShowCompletionModal(true)
    }

    // Terminer la session après confirmation
    const handleConfirmStopSession = () => {
        if (activeSession?.id) {
            // Capturer la durée finale avant de terminer
            setFinalDuration(elapsedTime)
            setShowCompletionModal(false)

            updateCompletedSession(activeSession.id, {
                onSuccess: () => {
                    setShowSummaryCard(true)
                },
                onError: (error) => {
                    console.error('Erreur lors de la complétion de la session:', error)
                    alert('Erreur lors de la finalisation de la séance. Veuillez réessayer.')
                }
            })
        }
    }

    const handleContinueToGeneration = () => {
        setShowSummaryCard(false)
        setShowGenerationModal(true)
    }

    const handleGenerateAdaptedSession = () => {
        if (!activeSession?.id) return

        createAdaptedSession(activeSession.id, {
            onSuccess: () => {
                cleanupSession()
                setShowGenerationModal(false)
                navigate('/programs')
            },
            onError: (error) => {
                console.error('Erreur création session adaptée:', error)
                alert('Erreur lors de la génération. Peut-être pas assez de données de performance.')
                cleanupSession()
                setShowGenerationModal(false)
                navigate('/programs')
            }
        })
    }

    const handleGenerateSimilarSession = () => {
        if (!activeSession?.id) return

        createSimilarSession(activeSession.id, {
            onSuccess: () => {
                cleanupSession()
                setShowGenerationModal(false)
                navigate('/programs')
            },
            onError: (error) => {
                console.error('Erreur création session similaire:', error)
                alert('Erreur lors de la génération de la session.')
                cleanupSession()
                setShowGenerationModal(false)
                navigate('/programs')
            }
        })
    }

    const handleCancelSession = async () => {
        setIsCancelling(true)

        try {
            // 1. Supprimer le TrainingSession en premier si on en a un
            // Cela supprimera automatiquement toutes les performances en cascade
            if (activeSession?.id) {
                await new Promise<void>((resolve, reject) => {
                    deleteSession(activeSession.id, {
                        onSuccess: () => {
                            console.log('✅ Session et performances supprimées avec succès')
                            resolve()
                        },
                        onError: (error) => {
                            console.error('❌ Erreur lors de la suppression de la session:', error)
                            reject(error)
                        }
                    })
                })
            } else {
                // 2. Si pas de sessionId (session non sauvegardée), supprimer les performances manuellement
                const performancesToDelete = getAllPerformances()
                    .filter(perf => perf.savedPerformanceId)
                    .map(perf => perf.savedPerformanceId!)

                if (performancesToDelete.length > 0) {
                    const deletePromises = performancesToDelete.map(
                        (performanceId) =>
                            new Promise((resolve, reject) => {
                                deletePerformance(performanceId, {
                                    onSuccess: () => {
                                        resolve(performanceId)
                                    },
                                    onError: (error) => {
                                        console.error('❌ Erreur suppression performance:', performanceId, error)
                                        reject(error)
                                    }
                                })
                            })
                    )

                    await Promise.all(deletePromises)
                }
            }

            // 3. Nettoyer tout
            cleanupSession()
            setShowCancelModal(false)
            setIsCancelling(false)
            navigate('/programs')
        } catch (error) {
            console.error('❌ Erreur lors de l\'annulation:', error)
            alert('Erreur lors de l\'annulation de la session.')
            setIsCancelling(false)
        }
    }

    const handlePerformanceChange = (
        exerciceSessionId: number,
        setIndex: number,
        field: 'reps_effectuees' | 'weight' | 'rpe',
        value: any
    ) => {
        // Validation : pas de valeurs négatives
        if (value < 0) {
            return
        }
        updatePerformance(exerciceSessionId, setIndex, { [field]: value })
    }

    const handleValidateSet = (exerciceSessionId: number, setIndex: number, reps_prevues: number, weight_prevue?: number) => {
        const key = `${exerciceSessionId}-${setIndex}`
        const perf = performances[key]

        // Si déjà validé, on dévalide et on supprime de la BDD
        if (perf?.success) {
            // Dévalider dans le store
            toggleSuccess(exerciceSessionId, setIndex)

            // Supprimer de la BDD si elle était sauvegardée
            if (perf.savedPerformanceId) {
                deletePerformance(perf.savedPerformanceId, {
                    onSuccess: () => {
                        // Nettoyer le savedPerformanceId du store
                        updatePerformance(exerciceSessionId, setIndex, { savedPerformanceId: undefined })
                    },
                    onError: (error) => {
                        console.error('❌ Erreur suppression performance:', error)
                        // En cas d'erreur, on revalide dans le store
                        toggleSuccess(exerciceSessionId, setIndex)
                    }
                })
            }
            return
        }

        // ✅ Utiliser les valeurs prévues comme fallback si non renseignées
        const reps = perf?.reps_effectuees ?? reps_prevues
        const weight = perf?.weight ?? (weight_prevue || 0)

        // Au moins l'un des deux doit être renseigné et > 0
        if (reps <= 0 && weight <= 0) {
            return
        }

        // Vérifier que les valeurs ne sont pas négatives
        if (reps < 0 || weight < 0) {
            return
        }

        // Marquer comme validé dans le store
        toggleSuccess(exerciceSessionId, setIndex)

        // Sauvegarder en BDD
        const payload = {
            exerciceSessionId: exerciceSessionId,
            reps_effectuees: reps,
            weight: weight,
            rpe: perf?.rpe
        }

        createPerformance(payload, {
            onSuccess: (data) => {
                markAsSaved(exerciceSessionId, setIndex, data.id_set)
            },
            onError: (error) => {
                console.error('❌ Erreur:', error)
                // Annuler la validation en cas d'erreur
                toggleSuccess(exerciceSessionId, setIndex)
            }
        })
    }

    if (!activeSession) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center p-6 text-white font-[Montserrat]">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 mx-auto bg-[#252527] rounded-full flex items-center justify-center border border-[#94fbdd]/20">
                        <PlayIcon className="h-8 w-8 text-[#94fbdd]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white mb-2">Aucune séance active</h1>
                        <p className="text-gray-400">
                            Sélectionnez un programme pour commencer votre entraînement.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/programs')}
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors shadow-lg shadow-[#94fbdd]/20"
                    >
                        Aller aux Programmes
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#121214] text-white pb-32 font-[Montserrat]">
            {/* Header Sticky */}
            <div className="bg-[#121214]/90 backdrop-blur-md border-b border-[#94fbdd]/10 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-[#94fbdd] uppercase tracking-widest mb-1">En cours</p>
                            <h1 className="text-lg font-bold text-white truncate">
                                {activeSession.trainingProgram?.name || 'Séance'}
                            </h1>
                            {activeSession.sessionName && (
                                <p className="text-sm text-gray-400 truncate">{activeSession.sessionName}</p>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-3xl font-mono font-medium tracking-tight tabular-nums text-white">
                                {formatTime(elapsedTime)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Exercices</h2>
                        <p className="text-sm text-gray-400 mt-1 font-medium">{validatedSets} / {totalSets} séries complétées</p>
                    </div>
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="text-sm text-red-400 hover:text-red-300 font-medium px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                    >
                        Annuler
                    </button>
                </div>

                {/* Liste des exercices */}
                <div className="space-y-8">
                    {activeSession.exercices?.map((exerciceSession: any, index: number) => {
                        const isCardio = exerciceSession.exercice?.type === 'CARDIO';

                        return (
                            <div key={exerciceSession.id || index} className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#94fbdd]/10 pb-3 gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Image */}
                                        <div className="relative w-12 h-12 rounded-lg bg-[#252527] overflow-hidden flex-shrink-0 border border-white/5">
                                            {getExerciseImageUrl(exerciceSession.exercice?.imageUrl) ? (
                                                <img
                                                    src={getExerciseImageUrl(exerciceSession.exercice?.imageUrl)!}
                                                    alt={exerciceSession.exercice?.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerText = '🏋️‍♂️';
                                                        (e.target as HTMLImageElement).parentElement!.className += ' flex items-center justify-center text-lg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg">
                                                    🏋️‍♂️
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-white truncate">
                                            {exerciceSession.exercice?.name || `Exercice ${index + 1}`}
                                        </h3>
                                    </div>

                                    {/* Pour cardio : afficher durée, sinon sets × reps */}
                                    {isCardio ? (
                                        <div className="text-sm sm:text-base font-mono bg-[#252527] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm border border-white/5 text-center">
                                            <span className="text-[#94fbdd] font-bold tabular-nums">{exerciceSession.reps}</span>
                                            <span className="text-gray-500 ml-1">min</span>
                                        </div>
                                    ) : (
                                        /* 🔧 Boutons +/- pour ajuster les séries */
                                        <div className="flex items-center gap-2 flex-shrink-0 group">
                                            {(() => {
                                                const validatedCount = getValidatedSetsCount(exerciceSession.id);
                                                const canDecrease = exerciceSession.sets > validatedCount && exerciceSession.sets > 1;

                                                return (
                                                    <button
                                                        onClick={() => updateExerciceSets({
                                                            exerciceSessionId: exerciceSession.id,
                                                            sets: Math.max(validatedCount, exerciceSession.sets - 1)
                                                        })}
                                                        disabled={!canDecrease || isUpdatingSets}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center hover:bg-[#2a2a2d] hover:border-[#94fbdd]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                                                        title={validatedCount > 0 && exerciceSession.sets <= validatedCount
                                                            ? `${validatedCount} série${validatedCount > 1 ? 's' : ''} déjà validée${validatedCount > 1 ? 's' : ''}`
                                                            : "Retirer une série"}
                                                    >
                                                        <MinusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-400" />
                                                    </button>
                                                );
                                            })()}

                                            <div className="text-sm sm:text-base font-mono bg-[#252527] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm border border-white/5 min-w-[70px] sm:min-w-[80px] text-center">
                                                <span className="text-[#94fbdd] font-bold tabular-nums">{exerciceSession.sets}</span>
                                                <span className="text-gray-500 mx-1">×</span>
                                                <span className="text-white font-semibold tabular-nums">{exerciceSession.reps}</span>
                                            </div>

                                            <button
                                                onClick={() => updateExerciceSets({
                                                    exerciceSessionId: exerciceSession.id,
                                                    sets: Math.min(20, exerciceSession.sets + 1)
                                                })}
                                                disabled={exerciceSession.sets >= 20 || isUpdatingSets}
                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center hover:bg-[#2a2a2d] hover:border-[#94fbdd]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                                                title="Ajouter une série"
                                            >
                                                <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#94fbdd]" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {/* Headers - différent pour cardio */}
                                    {isCardio ? (
                                        <div className="grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold px-2 mb-2">
                                            <div className="col-span-2 text-center">#</div>
                                            <div className="col-span-7 text-center">Minutes</div>
                                            <div className="col-span-3 text-center">Statut</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold px-2 mb-2">
                                            <div className="col-span-1 text-center">#</div>
                                            <div className="col-span-4 text-center">Reps</div>
                                            <div className="col-span-4 text-center">Poids (kg)</div>
                                            <div className="col-span-3 text-center">Statut</div>
                                        </div>
                                    )}

                                    {Array.from({ length: exerciceSession.sets }).map((_, setIndex) => {
                                        const perfKey = `${exerciceSession.id}-${setIndex}`;
                                        const perf = performances[perfKey] || {};
                                        const isDone = perf.success;

                                        // Pour cardio : reps contient maintenant la durée
                                        const defaultValue = exerciceSession.reps;

                                        return (
                                            <div
                                                key={setIndex}
                                                className={`grid grid-cols-12 gap-3 items-center p-2 rounded-xl border transition-all duration-200 ${isDone
                                                    ? 'bg-[#94fbdd]/10 border-[#94fbdd]/20'
                                                    : 'bg-[#252527]/50 border-transparent hover:bg-[#252527]'
                                                    }`}
                                            >
                                                <div className={`${isCardio ? 'col-span-2' : 'col-span-1'} text-center font-mono text-gray-500 text-sm font-bold`}>
                                                    {setIndex + 1}
                                                </div>

                                                {isCardio ? (
                                                    /* Input minutes pour cardio */
                                                    <div className="col-span-7">
                                                        <input
                                                            type="number"
                                                            placeholder={defaultValue.toString()}
                                                            value={perf.reps_effectuees || ''}
                                                            onChange={(e) => handlePerformanceChange(exerciceSession.id, setIndex, 'reps_effectuees', parseInt(e.target.value) || 0)}
                                                            className={`w-full bg-[#121214] border text-center rounded-lg py-2 text-sm font-semibold focus:ring-1 focus:ring-[#94fbdd] transition-all outline-none tabular-nums ${isDone
                                                                ? 'border-[#94fbdd]/20 text-gray-400'
                                                                : 'border-[#94fbdd]/10 text-white focus:border-[#94fbdd]/50'
                                                                }`}
                                                        />
                                                    </div>
                                                ) : (
                                                    /* Inputs reps et poids pour exercices normaux */
                                                    <>
                                                        <div className="col-span-4">
                                                            <input
                                                                type="number"
                                                                placeholder={exerciceSession.reps.toString()}
                                                                value={perf.reps_effectuees || ''}
                                                                onChange={(e) => handlePerformanceChange(exerciceSession.id, setIndex, 'reps_effectuees', parseInt(e.target.value) || 0)}
                                                                className={`w-full bg-[#121214] border text-center rounded-lg py-2 text-sm font-semibold focus:ring-1 focus:ring-[#94fbdd] transition-all outline-none tabular-nums ${isDone
                                                                    ? 'border-[#94fbdd]/20 text-gray-400'
                                                                    : 'border-[#94fbdd]/10 text-white focus:border-[#94fbdd]/50'
                                                                    }`}
                                                            />
                                                        </div>

                                                        <div className="col-span-4">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                placeholder={exerciceSession.weight?.toString() || '0'}
                                                                value={perf.weight || ''}
                                                                onChange={(e) => handlePerformanceChange(exerciceSession.id, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                                                className={`w-full bg-[#121214] border text-center rounded-lg py-2 text-sm font-semibold focus:ring-1 focus:ring-[#94fbdd] transition-all outline-none tabular-nums ${isDone
                                                                    ? 'border-[#94fbdd]/20 text-gray-400'
                                                                    : 'border-[#94fbdd]/10 text-white focus:border-[#94fbdd]/50'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <div className="col-span-3 flex justify-center">
                                                    <button
                                                        onClick={() => handleValidateSet(exerciceSession.id, setIndex, defaultValue, isCardio ? 0 : exerciceSession.weight)}
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${isDone
                                                            ? 'bg-[#94fbdd] text-[#121214] shadow-md shadow-[#94fbdd]/20'
                                                            : 'bg-[#121214] text-gray-600 border border-[#252527] hover:border-[#94fbdd]/30 hover:text-gray-400'
                                                            }`}
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bouton de fin de séance (intégré au flux) */}
                <div className="pt-4 pb-8">
                    <button
                        onClick={handleRequestStopSession}
                        disabled={!allSetsValidated}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${allSetsValidated
                            ? 'bg-[#94fbdd] text-[#121214] hover:bg-[#7de0c4] hover:shadow-[#94fbdd]/20'
                            : 'bg-[#252527] text-gray-500 cursor-not-allowed border border-[#94fbdd]/5'
                            }`}
                    >
                        {allSetsValidated ? (
                            <>
                                <StopIcon className="w-5 h-5" />
                                Terminer la séance
                            </>
                        ) : (
                            <span className="font-mono text-xs">{validatedSets}/{totalSets} séries complétées</span>
                        )}
                    </button>
                    {!allSetsValidated && (
                        <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                            Validez toutes les séries pour terminer
                        </p>
                    )}
                </div>
            </div>

            {/* Modals - Mobile-first optimized */}
            <Modal isOpen={showSummaryCard} onClose={() => { }} showClose={false}>
                <div className="p-4 sm:p-6 bg-[#252527] text-white max-h-[90vh] overflow-y-auto rounded-3xl ">
                    <div className="text-center space-y-3 mb-4">
                        <div className="w-12 h-12 bg-[#94fbdd]/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircleIcon className="w-6 h-6 text-[#94fbdd]" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">Séance terminée</h2>
                    </div>

                    <div className="mb-4">
                        <SessionSummaryCard
                            sessionData={{
                                programName: activeSession?.trainingProgram?.name,
                                duration: finalDuration,
                                totalExercises: activeSession?.exercices?.length || 0,
                                totalSets: totalSets,
                                completedSets: validatedSets,
                                caloriesBurned: activeSession?.summary?.caloriesBurned, // 🔥 Calories brûlées
                                exercises: (activeSession?.exercices || []).map((ex: any) => ({
                                    name: ex.exercice?.name || 'Exercice',
                                    type: ex.exercice?.type || null, // 🆕 Pour cardio
                                    sets: ex.sets,
                                    reps: ex.reps,
                                    weight: ex.weight
                                })),
                                date: new Date()
                            }}
                        />
                    </div>

                    <button
                        onClick={handleContinueToGeneration}
                        className="w-full py-3 sm:py-3.5 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors shadow-lg shadow-[#94fbdd]/10 sticky bottom-0"
                    >
                        Continuer
                    </button>
                </div>
            </Modal>

            <Modal isOpen={showGenerationModal} onClose={() => { }} showClose={false}>
                <div className="p-6 bg-[#252527] text-white rounded-3xl">
                    <h2 className="text-xl font-bold text-center mb-2 text-white">Prochaine étape</h2>
                    <p className="text-gray-400 text-center mb-8 text-sm">
                        Comment voulez-vous générer votre prochaine séance ?
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleGenerateAdaptedSession}
                            disabled={isAdaptingSession || isCreatingSimilar}
                            className="w-full flex items-center justify-center px-4 py-4 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors disabled:opacity-50 shadow-lg shadow-[#94fbdd]/10"
                        >
                            {isAdaptingSession ? 'Génération...' : (
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5" />
                                    <span>Adapter selon mes perfs</span>
                                </div>
                            )}
                        </button>
                        <button
                            onClick={handleGenerateSimilarSession}
                            disabled={isAdaptingSession || isCreatingSimilar}
                            className="w-full flex items-center justify-center px-4 py-4 bg-transparent border border-[#94fbdd]/20 text-white font-bold rounded-xl hover:bg-[#121214] transition-colors disabled:opacity-50"
                        >
                            {isCreatingSimilar ? 'Génération...' : (
                                <div className="flex items-center gap-2">
                                    <ArrowPathIcon className="h-5 w-5" />
                                    <span>Répéter la même séance</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)}>
                <div className="p-6 bg-[#252527] text-white rounded-3xl">
                    <h2 className="text-lg font-bold text-white mb-6 text-center">Terminer la séance ?</h2>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleConfirmStopSession}
                            className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold hover:bg-[#7de0c4] transition-colors shadow-lg shadow-[#94fbdd]/10"
                        >
                            Oui, terminer
                        </button>
                        <button
                            onClick={() => setShowCompletionModal(false)}
                            className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-bold hover:bg-[#121214] transition-colors"
                        >
                            Continuer l'entraînement
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showCancelModal} onClose={() => !isCancelling && setShowCancelModal(false)}>
                <div className="p-6 bg-[#252527] text-white">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XMarkIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white text-center mb-2">Annuler la séance ?</h2>
                    <p className="text-sm text-gray-400 text-center mb-6">
                        Cette action est irréversible.
                    </p>

                    {getAllPerformances().filter(p => p.savedPerformanceId).length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                            <p className="text-xs text-red-300 text-center">
                                <strong>{getAllPerformances().filter(p => p.savedPerformanceId).length}</strong> performance(s) enregistrée(s) seront supprimée(s).
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setShowCancelModal(false)}
                            disabled={isCancelling}
                            className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-white font-bold hover:bg-[#121214] transition-colors"
                        >
                            Reprendre la séance
                        </button>
                        <button
                            onClick={handleCancelSession}
                            disabled={isCancelling}
                            className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg shadow-red-500/20"
                        >
                            {isCancelling ? 'Annulation...' : 'Annuler définitivement'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    )
}
