import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayIcon, StopIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'
import useCreatePerformance from '../../api/hooks/performance/useCreatePerformance'
import useDeletePerformance from '../../api/hooks/performance/useDeletePerformance'
import useUpdateCompletedSession from '../../api/hooks/session/useUpdateCompletedSession'
import useCreateAdaptedSession from '../../api/hooks/session-adaptation/useCreateAdaptedSession'
import useCreateNewSimilarSession from '../../api/hooks/session-adaptation/useCreateNewSimilarSession'
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../../components/ui/modal'
import Button from '../../components/ui/button/Button'
import { usePerformanceStore } from '../../store/usePerformanceStore'

export default function ActiveSession() {
    const navigate = useNavigate()
    const [activeSession, setActiveSession] = useState<any>(null)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [showGenerationModal, setShowGenerationModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    // Zustand store
    const {
        performances,
        sessionId,
        setSessionId,
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

    // Charger la session active depuis localStorage au montage
    useEffect(() => {
        const savedSession = localStorage.getItem('activeSession')
        const savedStartTime = localStorage.getItem('sessionStartTime')

        if (savedSession) {
            const session = JSON.parse(savedSession)
            setActiveSession(session)

            // Initialiser le sessionId dans le store
            if (session.id && sessionId !== session.id) {
                setSessionId(session.id)
            }
        }

        if (savedStartTime) {
            setStartTime(parseInt(savedStartTime))
        }
    }, [sessionId, setSessionId])

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
                // Nettoyer tout
                clearSession()
                setShowGenerationModal(false)
                localStorage.removeItem('activeSession')
                localStorage.removeItem('sessionStartTime')
                navigate('/programs')
            },
            onError: (error) => {
                console.error('Erreur création session adaptée:', error)
                alert('Erreur lors de la génération. Peut-être pas assez de données de performance.')
                clearSession()
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
                clearSession()
                setShowGenerationModal(false)
                localStorage.removeItem('activeSession')
                localStorage.removeItem('sessionStartTime')
                navigate('/programs')
            },
            onError: (error) => {
                console.error('Erreur création session similaire:', error)
                alert('Erreur lors de la génération de la session.')
                clearSession()
                setShowGenerationModal(false)
                localStorage.removeItem('activeSession')
                localStorage.removeItem('sessionStartTime')
                navigate('/programs')
            }
        })
    }

    const handleCancelSession = async () => {
        setIsCancelling(true)

        // Supprimer toutes les performances sauvegardées en BDD
        const performancesToDelete = getAllPerformances()
            .filter(perf => perf.savedPerformanceId)
            .map(perf => perf.savedPerformanceId!)

        if (performancesToDelete.length > 0) {
            console.log('🗑️ Suppression de', performancesToDelete.length, 'performances')

            const deletePromises = performancesToDelete.map(
                (performanceId) =>
                    new Promise((resolve, reject) => {
                        deletePerformance(performanceId, {
                            onSuccess: () => {
                                console.log('✅ Performance supprimée:', performanceId)
                                resolve(performanceId)
                            },
                            onError: (error) => {
                                console.error('❌ Erreur suppression performance:', performanceId, error)
                                reject(error)
                            }
                        })
                    })
            )

            try {
                await Promise.all(deletePromises)
                console.log('✅ Toutes les performances ont été supprimées')
            } catch (error) {
                console.error('❌ Erreur lors de la suppression des performances:', error)
                alert('Certaines performances n\'ont pas pu être supprimées.')
            }
        }

        // Nettoyer tout
        clearSession()
        localStorage.removeItem('activeSession')
        localStorage.removeItem('sessionStartTime')
        setShowCancelModal(false)
        setIsCancelling(false)
        navigate('/programs')
    }

    const handlePerformanceChange = (
        exerciceSessionId: number,
        setIndex: number,
        field: 'reps_effectuees' | 'weight' | 'rpe',
        value: any
    ) => {
        updatePerformance(exerciceSessionId, setIndex, { [field]: value })
    }

    const handleValidateSet = (exerciceSessionId: number, setIndex: number) => {
        const key = `${exerciceSessionId}-${setIndex}`
        const perf = performances[key]

        // Si déjà validé, on peut juste toggle (dévalider)
        if (perf?.success) {
            toggleSuccess(exerciceSessionId, setIndex)
            return
        }

        // Validation des données
        if (!perf?.reps_effectuees && !perf?.weight) {
            alert('Veuillez entrer au moins les répétitions ou le poids.')
            return
        }

        // Marquer comme validé dans le store
        toggleSuccess(exerciceSessionId, setIndex)

        // Sauvegarder en BDD
        const payload = {
            exerciceSessionId: exerciceSessionId,
            reps_effectuees: perf.reps_effectuees || 0,
            weight: perf.weight || 0,
            rpe: perf.rpe
        }

        createPerformance(payload, {
            onSuccess: (data) => {
                console.log('✅ Performance sauvegardée:', key, 'ID:', data.id_set)
                // Marquer comme sauvegardé avec l'ID
                markAsSaved(exerciceSessionId, setIndex, data.id_set)
            },
            onError: (error) => {
                console.error('❌ Erreur:', error)
                alert('Erreur lors de la sauvegarde.')
                // Annuler la validation en cas d'erreur
                toggleSuccess(exerciceSessionId, setIndex)
            }
        })
    }

    if (!activeSession) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4 sm:p-6">
                <div className="relative max-w-md w-full bg-[#252527] rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-[#94fbdd]/10 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl"></div>

                    <div className="relative space-y-6">
                        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#94fbdd]/20 to-[#94fbdd]/5 rounded-3xl flex items-center justify-center shadow-xl">
                            <PlayIcon className="h-10 w-10 sm:h-12 sm:w-12 text-[#94fbdd]" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Aucune séance active</h1>
                            <p className="text-sm sm:text-base text-gray-400 max-w-sm mx-auto">
                                Démarrez une séance depuis la page Programmes pour commencer votre entraînement
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/programs')}
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#94fbdd] text-[#121214] font-bold rounded-2xl shadow-lg shadow-[#94fbdd]/30 hover:bg-[#94fbdd]/90 hover:shadow-xl hover:shadow-[#94fbdd]/40 transition-all active:scale-95"
                        >
                            Aller aux Programmes
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Header avec chrono */}
                <div className="relative bg-gradient-to-br from-[#252527] to-[#121214] rounded-3xl shadow-2xl overflow-hidden border border-[#94fbdd]/10 p-6 sm:p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <PlayIcon className="h-6 w-6 text-[#94fbdd] animate-pulse" />
                                    <span className="text-xs sm:text-sm font-bold text-[#94fbdd] uppercase tracking-wide">En cours</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Séance active</h1>
                                {activeSession.trainingProgram?.name && (
                                    <p className="text-sm text-gray-400">
                                        {activeSession.trainingProgram.name}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="flex-shrink-0 p-2 sm:p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all active:scale-95 group"
                                title="Annuler la séance"
                            >
                                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 group-hover:text-red-300 transition-colors" />
                            </button>
                        </div>

                        {/* Chronomètre */}
                        <div className="relative bg-[#121214]/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-[#94fbdd]/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#94fbdd]/5 to-transparent rounded-2xl"></div>
                            <div className="relative text-center">
                                <p className="text-xs sm:text-sm text-gray-400 mb-3 uppercase tracking-wide">Durée</p>
                                <p className="text-5xl sm:text-6xl font-bold font-mono tracking-wider text-white">
                                    {formatTime(elapsedTime)}
                                </p>
                                <div className="mt-6 flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#94fbdd] rounded-full animate-pulse"></div>
                                        <span className="text-xs text-gray-400">
                                            {validatedSets}/{totalSets} séries
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {activeSession.notes && (
                    <div className="relative bg-[#252527] rounded-2xl p-4 sm:p-5 border-l-4 border-[#94fbdd] overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#94fbdd]/5 rounded-full blur-2xl"></div>
                        <p className="relative text-sm text-[#94fbdd] font-medium">{activeSession.notes}</p>
                    </div>
                )}

                {/* Liste des exercices */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Exercices</h2>
                        <div className="px-3 py-1.5 bg-[#252527] rounded-xl border border-[#94fbdd]/20">
                            <span className="text-xs font-bold text-[#94fbdd]">
                                {validatedSets}/{totalSets}
                            </span>
                        </div>
                    </div>

                    {activeSession.exercices?.map((exerciceSession: any, index: number) => (
                        <div
                            key={exerciceSession.id || index}
                            className="relative bg-[#252527] rounded-2xl sm:rounded-3xl shadow-xl border border-[#94fbdd]/10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#94fbdd]/5 to-transparent rounded-full blur-2xl"></div>

                            {/* Header exercice */}
                            <div className="relative p-4 sm:p-5 border-b border-[#94fbdd]/10">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                                    {exerciceSession.exercice?.name || `Exercice ${index + 1}`}
                                </h3>
                                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400">
                                    <span className="font-medium">{exerciceSession.sets} séries</span>
                                    <span className="text-[#94fbdd]/50">•</span>
                                    <span className="font-medium">{exerciceSession.reps} reps</span>
                                    {exerciceSession.weight && (
                                        <>
                                            <span className="text-[#94fbdd]/50">•</span>
                                            <span className="font-medium">{exerciceSession.weight} kg</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Séries */}
                            <div className="relative p-4 sm:p-5 space-y-3">
                                {Array.from({ length: exerciceSession.sets }).map((_, setIndex) => {
                                    const perfKey = `${exerciceSession.id}-${setIndex}`;
                                    const perf = performances[perfKey] || {};

                                    return (
                                        <div
                                            key={setIndex}
                                            className={`relative bg-[#121214]/40 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all ${perf.success
                                                ? 'border-[#94fbdd]/50 bg-[#94fbdd]/5'
                                                : 'border-[#94fbdd]/10 hover:border-[#94fbdd]/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Numéro */}
                                                <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${perf.success
                                                    ? 'bg-gradient-to-br from-[#94fbdd] to-[#72e8cc] text-[#121214] shadow-lg shadow-[#94fbdd]/30'
                                                    : 'bg-[#252527] text-gray-400 border border-[#94fbdd]/20'
                                                    }`}>
                                                    {setIndex + 1}
                                                </div>

                                                {/* Inputs */}
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-gray-400 font-medium block mb-1.5">
                                                            Reps
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
                                                            className="w-full px-3 py-2.5 bg-[#252527] border border-[#94fbdd]/20 rounded-xl text-white text-center font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-xs text-gray-400 font-medium block mb-1.5">
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
                                                            className="w-full px-3 py-2.5 bg-[#252527] border border-[#94fbdd]/20 rounded-xl text-white text-center font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bouton validation */}
                                                <button
                                                    onClick={() => handleValidateSet(exerciceSession.id, setIndex)}
                                                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all ${perf.success
                                                        ? 'bg-[#94fbdd] shadow-lg shadow-[#94fbdd]/40 hover:shadow-xl hover:shadow-[#94fbdd]/50 active:scale-95'
                                                        : 'bg-[#252527] border-2 border-[#94fbdd]/30 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/50 active:scale-95'
                                                        }`}
                                                >
                                                    <CheckCircleIcon
                                                        className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${perf.success ? 'text-[#121214]' : 'text-gray-400'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bouton Terminer */}
                <div className="fixed bottom-24 left-0 right-0 p-4 sm:px-6 pointer-events-none">
                    <div className="max-w-5xl mx-auto">
                        <button
                            onClick={handleStopSession}
                            disabled={!allSetsValidated}
                            className={`w-full font-bold py-4 sm:py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 text-base sm:text-lg pointer-events-auto ${allSetsValidated
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-red-500/50 active:scale-95'
                                : 'bg-[#252527] text-gray-500 border-2 border-[#94fbdd]/10 cursor-not-allowed'
                                }`}
                        >
                            <StopIcon className="h-6 w-6" />
                            {allSetsValidated
                                ? 'Terminer la séance'
                                : `Validez toutes les séries (${validatedSets}/${totalSets})`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de génération */}
            <Modal isOpen={showGenerationModal} onClose={() => { }}>
                <ModalHeader>
                    <div className="flex items-center gap-3 justify-center">
                        <div className="p-3 bg-[#94fbdd]/10 rounded-2xl">
                            <CheckCircleIcon className="h-7 w-7 text-[#94fbdd]" />
                        </div>
                        <ModalTitle className="text-xl sm:text-2xl">Séance terminée ! 🎉</ModalTitle>
                    </div>
                </ModalHeader>
                <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                    <p className="text-sm sm:text-base text-gray-300 text-center">
                        Félicitations pour avoir terminé votre séance !
                    </p>
                    <p className="text-sm sm:text-base text-gray-300 text-center">
                        Voulez-vous générer automatiquement votre prochaine séance ?
                    </p>
                    <div className="space-y-3 mt-4">
                        <div className="group bg-[#94fbdd]/5 hover:bg-[#94fbdd]/10 p-4 rounded-2xl border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 transition-all cursor-pointer">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-lg">✨</span>
                                Session adaptée
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-400">
                                La prochaine séance sera ajustée selon vos performances pour optimiser votre progression.
                            </p>
                        </div>
                        <div className="group bg-[#252527]/50 hover:bg-[#252527] p-4 rounded-2xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/20 transition-all cursor-pointer">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-lg">🔁</span>
                                Session similaire
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-400">
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

            {/* Modal d'annulation */}
            <Modal isOpen={showCancelModal} onClose={() => !isCancelling && setShowCancelModal(false)}>
                <ModalHeader>
                    <div className="flex items-center gap-3 justify-center">
                        <div className="p-3 bg-red-500/10 rounded-2xl">
                            <XMarkIcon className="h-7 w-7 text-red-400" />
                        </div>
                        <ModalTitle className="text-xl sm:text-2xl">Annuler la séance ?</ModalTitle>
                    </div>
                </ModalHeader>
                <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                    <p className="text-sm sm:text-base text-gray-300 text-center">
                        Êtes-vous sûr de vouloir annuler cette séance ?
                    </p>
                    {getAllPerformances().filter(p => p.savedPerformanceId).length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                            <p className="text-sm text-red-300 text-center">
                                <strong>{getAllPerformances().filter(p => p.savedPerformanceId).length}</strong> performance{getAllPerformances().filter(p => p.savedPerformanceId).length > 1 ? 's' : ''}
                                {' '}enregistrée{getAllPerformances().filter(p => p.savedPerformanceId).length > 1 ? 's' : ''} {getAllPerformances().filter(p => p.savedPerformanceId).length > 1 ? 'seront supprimées' : 'sera supprimée'}.
                            </p>
                        </div>
                    )}
                    <p className="text-xs sm:text-sm text-gray-400 text-center">
                        Cette action est irréversible.
                    </p>
                </div>
                <ModalFooter>
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => setShowCancelModal(false)}
                            disabled={isCancelling}
                            className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                        >
                            Continuer la séance
                        </button>
                        <button
                            onClick={handleCancelSession}
                            disabled={isCancelling}
                            className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isCancelling ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Annulation...
                                </>
                            ) : (
                                'Annuler la séance'
                            )}
                        </button>
                    </div>
                </ModalFooter>
            </Modal>
        </div>
    )
}
