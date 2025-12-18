import { useState, useRef } from 'react'
import {
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



    return (
        <div className="space-y-4 font-[Montserrat]">
            {/* La carte à capturer - Design sobre et professionnel */}
            <div
                ref={cardRef}
                className="relative bg-[#121214] text-white p-6 rounded-2xl border border-[#94fbdd]/20 shadow-2xl"
            >
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-white">MYO FITNESS</h3>
                        <p className="text-[10px] uppercase tracking-widest text-[#94fbdd] font-bold mt-1">Séance terminée</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 font-mono block font-medium">{formatDate(sessionData.date)}</span>
                    </div>
                </div>

                {sessionData.programName && (
                    <div className="mb-8 p-3 bg-[#252527] rounded-xl border-l-4 border-[#94fbdd]">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Programme</h4>
                        <p className="text-lg font-bold text-white leading-tight">{sessionData.programName}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-6 mb-8 border-t border-b border-[#94fbdd]/10 py-6">
                    <div className="text-center">
                        <p className="text-3xl font-mono font-bold tracking-tight text-white">{formatDuration(sessionData.duration)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-2 font-bold">Durée</p>
                    </div>
                    <div className="text-center border-l border-[#94fbdd]/10">
                        <p className="text-3xl font-mono font-bold tracking-tight text-white">{sessionData.totalExercises}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-2 font-bold">Exercices</p>
                    </div>
                    <div className="text-center border-l border-[#94fbdd]/10">
                        <p className="text-3xl font-mono font-bold tracking-tight text-white">{sessionData.completedSets}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-2 font-bold">Séries</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Aperçu de la séance</h4>
                    <div className="space-y-2">
                        {sessionData.exercises.slice(0, 5).map((exercise, index) => (
                            <div key={index} className="flex items-baseline justify-between text-sm group p-2 rounded-lg hover:bg-[#252527] transition-colors">
                                <div className="flex items-baseline gap-3 overflow-hidden">
                                    <span className="text-[#94fbdd] font-mono text-xs font-bold">{index + 1}</span>
                                    <span className="text-gray-200 truncate font-semibold">{exercise.name}</span>
                                </div>
                                <span className="font-mono text-gray-500 text-xs whitespace-nowrap pl-4 font-medium">
                                    {exercise.sets} × {exercise.reps} {exercise.weight ? `@ ${exercise.weight}kg` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                    {sessionData.exercises.length > 5 && (
                        <p className="text-xs text-gray-500 italic mt-2 pt-2 border-t border-[#94fbdd]/10 text-center">
                            ... et {sessionData.exercises.length - 5} autres exercices
                        </p>
                    )}
                </div>

                <div className="pt-4 border-t border-[#94fbdd]/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#94fbdd] animate-pulse"></div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Performance validée</p>
                    </div>
                    <p className="text-[10px] font-bold text-gray-700">Myo Fitness App</p>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleDownload}
                    disabled={isCapturing}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#252527] text-white font-bold rounded-xl border border-[#94fbdd]/20 hover:bg-[#2a2a2d] transition-colors disabled:opacity-50"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span className="text-sm">Télécharger</span>
                </button>
                <button
                    onClick={handleShare}
                    disabled={isCapturing}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors disabled:opacity-50 shadow-lg shadow-[#94fbdd]/20"
                >
                    <ShareIcon className="w-4 h-4" />
                    <span className="text-sm">Partager</span>
                </button>
            </div>
        </div>
    )
}
