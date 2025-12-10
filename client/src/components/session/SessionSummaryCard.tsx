import { useState, useRef } from 'react'
import {
    FireIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowDownTrayIcon,
    ShareIcon
} from '@heroicons/react/24/solid'
import html2canvas from 'html2canvas'

interface SessionSummaryCardProps {
    sessionData: {
        programName?: string
        duration: number // en millisecondes
        totalExercises: number
        totalSets: number
        completedSets: number
        exercises: Array<{
            name: string
            sets: number
            reps: number
            weight?: number
        }>
        date: Date
    }
    onShare?: () => void
    onDownload?: () => void
}

export default function SessionSummaryCard({ sessionData, onShare, onDownload }: SessionSummaryCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isCapturing, setIsCapturing] = useState(false)

    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m ${seconds}s`
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date)
    }

    const handleDownload = async () => {
        if (!cardRef.current) return

        setIsCapturing(true)
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#121214',
                scale: 2,
                logging: false,
                useCORS: true
            })

            const link = document.createElement('a')
            link.download = `myo-fitness-session-${Date.now()}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()

            if (onDownload) onDownload()
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error)
        } finally {
            setIsCapturing(false)
        }
    }

    const handleShare = async () => {
        if (!cardRef.current) return

        setIsCapturing(true)
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#121214',
                scale: 2,
                logging: false,
                useCORS: true
            })

            canvas.toBlob(async (blob: Blob | null) => {
                if (!blob) return

                const file = new File([blob], 'myo-fitness-session.png', { type: 'image/png' })

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Ma séance Myo Fitness',
                            text: `🏋️ Séance terminée sur Myo Fitness ! ${sessionData.totalSets} séries complétées en ${formatDuration(sessionData.duration)} 💪`
                        })
                        if (onShare) onShare()
                    } catch (error) {
                        console.error('Erreur lors du partage:', error)
                    }
                } else {
                    // Fallback: télécharger l'image
                    handleDownload()
                }
                setIsCapturing(false)
            }, 'image/png')
        } catch (error) {
            console.error('Erreur lors du partage:', error)
            setIsCapturing(false)
        }
    }

    const completionRate = (sessionData.completedSets / sessionData.totalSets) * 100

    return (
        <div className="space-y-3">
            {/* La carte à capturer - Version mobile optimisée */}
            <div
                ref={cardRef}
                className="relative bg-gradient-to-br from-[#1a1a1d] via-[#252527] to-[#1a1a1d] rounded-2xl overflow-hidden border-2 border-[#94fbdd]/30 shadow-2xl"
            >
                {/* Background effects */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-[#94fbdd]/20 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative p-4 space-y-4">
                    {/* Header compact */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#94fbdd] to-[#72e8cc] rounded-xl flex items-center justify-center shadow-lg shadow-[#94fbdd]/50">
                                <FireIcon className="w-5 h-5 text-[#121214]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">
                                    MYO FITNESS
                                </h3>
                                <p className="text-[10px] text-[#94fbdd] font-bold uppercase tracking-wider">
                                    Séance terminée
                                </p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-[#94fbdd]/10 border border-[#94fbdd]/30 rounded-full">
                            <span className="text-xs font-bold text-[#94fbdd]">
                                {formatDate(sessionData.date)}
                            </span>
                        </div>
                    </div>

                    {/* Programme name - compact */}
                    {sessionData.programName && (
                        <div className="bg-gradient-to-r from-[#94fbdd]/10 to-transparent border-l-4 border-[#94fbdd] rounded-r-xl px-3 py-2">
                            <p className="text-sm font-bold text-white truncate">
                                {sessionData.programName}
                            </p>
                        </div>
                    )}

                    {/* Stats principales - compact */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Durée */}
                        <div className="bg-[#121214]/60 backdrop-blur-xl rounded-xl p-3 border border-[#94fbdd]/20">
                            <ClockIcon className="w-5 h-5 text-[#94fbdd] mb-1" />
                            <p className="text-xl font-black text-white leading-tight">
                                {formatDuration(sessionData.duration)}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                Durée
                            </p>
                        </div>

                        {/* Exercices */}
                        <div className="bg-[#121214]/60 backdrop-blur-xl rounded-xl p-3 border border-violet-400/20">
                            <div className="w-5 h-5 bg-gradient-to-br from-violet-400 to-violet-500 rounded-md flex items-center justify-center mb-1">
                                <span className="text-white font-black text-xs">
                                    {sessionData.totalExercises}
                                </span>
                            </div>
                            <p className="text-xl font-black text-white leading-tight">
                                {sessionData.totalExercises}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                Exercices
                            </p>
                        </div>

                        {/* Séries */}
                        <div className="bg-[#121214]/60 backdrop-blur-xl rounded-xl p-3 border border-[#94fbdd]/20">
                            <CheckCircleIcon className="w-5 h-5 text-[#94fbdd] mb-1" />
                            <p className="text-xl font-black text-white leading-tight">
                                {sessionData.completedSets}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                Séries
                            </p>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                                Complétion
                            </span>
                            <span className="text-xs font-black text-[#94fbdd]">
                                {completionRate.toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-2 bg-[#121214]/60 rounded-full overflow-hidden border border-[#94fbdd]/20">
                            <div
                                className="h-full bg-gradient-to-r from-[#94fbdd] via-[#72e8cc] to-[#94fbdd] rounded-full shadow-lg shadow-[#94fbdd]/50 transition-all duration-1000 ease-out"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Liste des exercices - ultra compact */}
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Exercices réalisés
                        </h4>
                        <div className="grid gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                            {sessionData.exercises.slice(0, 4).map((exercise, index) => (
                                <div
                                    key={index}
                                    className="bg-[#121214]/40 backdrop-blur-sm rounded-lg p-2 border border-[#94fbdd]/10 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-6 h-6 bg-gradient-to-br from-[#94fbdd]/20 to-[#94fbdd]/5 rounded-md flex items-center justify-center border border-[#94fbdd]/20 flex-shrink-0">
                                            <span className="text-[10px] font-black text-[#94fbdd]">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-white truncate">
                                            {exercise.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 flex-shrink-0">
                                        <span className="font-medium">
                                            {exercise.sets}×{exercise.reps}
                                        </span>
                                        {exercise.weight && (
                                            <>
                                                <span className="text-[#94fbdd]/30">•</span>
                                                <span className="font-medium text-[#94fbdd]">
                                                    {exercise.weight}kg
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {sessionData.exercises.length > 4 && (
                                <div className="text-center py-1">
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        +{sessionData.exercises.length - 4} autres
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer compact */}
                    <div className="pt-3 border-t border-[#94fbdd]/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="flex -space-x-1">
                                    <div className="w-6 h-6 bg-gradient-to-br from-[#94fbdd] to-[#72e8cc] rounded-full flex items-center justify-center border-2 border-[#121214] shadow-lg">
                                        <span className="text-[10px]">💪</span>
                                    </div>
                                    <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-violet-500 rounded-full flex items-center justify-center border-2 border-[#121214] shadow-lg">
                                        <span className="text-[10px]">🔥</span>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-white">
                                    Excellent travail !
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-medium">
                                    via
                                </p>
                                <p className="text-xs font-black text-[#94fbdd]">
                                    MYO FITNESS
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Boutons d'action - compact */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleDownload}
                    disabled={isCapturing}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#252527] hover:bg-[#2a2a2d] text-white font-bold text-sm rounded-xl border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {isCapturing ? 'Génération...' : 'Télécharger'}
                </button>
                <button
                    onClick={handleShare}
                    disabled={isCapturing}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#94fbdd] to-[#72e8cc] hover:shadow-lg hover:shadow-[#94fbdd]/30 text-[#121214] font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShareIcon className="w-4 h-4" />
                    {isCapturing ? 'Génération...' : 'Partager'}
                </button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(148, 251, 221, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 251, 221, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 251, 221, 0.5);
                }
            `}</style>
        </div>
    )
}
