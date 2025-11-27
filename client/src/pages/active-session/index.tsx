import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayIcon, StopIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import useCreatePerformance from '../../api/hooks/performance/useCreatePerformance'
import useUpdateCompletedSession from '../../api/hooks/session/useUpdateCompletedSession'

export default function ActiveSession() {
    const navigate = useNavigate()
    const [activeSession, setActiveSession] = useState<any>(null)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [performances, setPerformances] = useState<Record<string, any>>({})

    const { mutate: createPerformance } = useCreatePerformance()
    const { mutate: updateCompletedSession } = useUpdateCompletedSession()

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

    const handleStopSession = () => {
        // Sauvegarder les performances
        Object.entries(performances).forEach(([_, perf]) => {
            if (perf.reps_effectuees || perf.weight) {
                const payload = {
                    exerciceSessionId: perf.exerciceSessionId,
                    reps_effectuees: perf.reps_effectuees,
                    weight: perf.weight,
                    rpe: perf.rpe
                }
                createPerformance(payload)
            }
        })

        if (activeSession?.id) {
            updateCompletedSession(activeSession.id, {
                onSuccess: () => {
                    localStorage.removeItem('activeSession')
                    localStorage.removeItem('sessionStartTime')
                    navigate('/programs')
                }
            })
        }
    }

    const handlePerformanceChange = (
        exerciceSessionId: number,
        setIndex: number,
        field: 'reps_effectuees' | 'weight' | 'success' | 'rpe',
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
                                                onClick={() =>
                                                    handlePerformanceChange(
                                                        exerciceSession.id,
                                                        setIndex,
                                                        'success',
                                                        !perf.success
                                                    )
                                                }
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
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                    <StopIcon className="h-6 w-6" />
                    Terminer la séance
                </button>
            </div>
        </section>
    )
}
