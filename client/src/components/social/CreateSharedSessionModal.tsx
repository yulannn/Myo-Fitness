import React, { useState } from 'react';
import { useCreateSharedSession } from '../../api/hooks/shared-session/useSharedSessions';
import { XMarkIcon, UsersIcon, MapPinIcon, CalendarDaysIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CreateSharedSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateSharedSessionModal: React.FC<CreateSharedSessionModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxParticipants, setMaxParticipants] = useState<number | ''>('');

    const createSession = useCreateSharedSession();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            if (!title) return;
            setStep(2);
            return;
        }

        if (!startTime) return;

        createSession.mutate({
            title,
            description,
            startTime: new Date(startTime).toISOString(),
            location,
            maxParticipants: maxParticipants === '' ? undefined : Number(maxParticipants),
        }, {
            onSuccess: () => {
                handleClose();
            }
        });
    };

    const handleClose = () => {
        setStep(1);
        setTitle('');
        setDescription('');
        setStartTime('');
        setLocation('');
        setMaxParticipants('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-md rounded-xl bg-[#18181b] p-6 shadow-2xl border border-white/5 relative mx-auto my-auto">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg z-10"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-[#94fbdd]/10 rounded-lg">
                            <UsersIcon className="h-6 w-6 text-[#94fbdd]" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            {step === 1 ? "Détails de la séance" : "Date et Participants"}
                        </h3>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                        <div className={`h-full bg-[#94fbdd] transition-all duration-300 ease-out ${step === 1 ? 'w-1/2' : 'w-full'}`} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">
                                    Titre <span className="text-[#94fbdd]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-lg bg-[#27272a] border border-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#94fbdd] focus:border-[#94fbdd] transition-all"
                                    placeholder="Ex: Séance Jambes Intense"
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-lg bg-[#27272a] border border-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#94fbdd] focus:border-[#94fbdd] transition-all min-h-[120px] resize-none"
                                    placeholder="Détails sur la séance..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                            {/* Date and Time */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <CalendarDaysIcon className="h-4 w-4 text-[#94fbdd]" />
                                    Date et Heure <span className="text-[#94fbdd]">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full max-w-full rounded-lg bg-[#27272a] border border-white/5 px-3 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#94fbdd] focus:border-[#94fbdd] transition-all [color-scheme:dark] text-sm"
                                    required
                                />
                            </div>

                            {/* Location and Max Participants */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <MapPinIcon className="h-4 w-4 text-[#94fbdd]" />
                                        Lieu
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full rounded-lg bg-[#27272a] border border-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#94fbdd] focus:border-[#94fbdd] transition-all"
                                        placeholder="Gym..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <UsersIcon className="h-4 w-4 text-[#94fbdd]" />
                                        Max
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        value={maxParticipants}
                                        onChange={(e) => setMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full rounded-lg bg-[#27272a] border border-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#94fbdd] focus:border-[#94fbdd] transition-all"
                                        placeholder="Illimité"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-4 py-3 rounded-lg border border-white/10 bg-transparent text-gray-300 hover:bg-white/5 transition-all"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={createSession.isPending || (step === 1 && !title) || (step === 2 && !startTime)}
                            className="flex-1 rounded-lg px-4 py-3 text-sm font-bold text-[#18181b] bg-[#94fbdd] hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {step === 1 ? (
                                <>
                                    Suivant <ArrowRightIcon className="h-4 w-4" />
                                </>
                            ) : (
                                createSession.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#18181b]/30 border-t-[#18181b] rounded-full animate-spin"></div>
                                        Création...
                                    </>
                                ) : 'Créer la séance'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSharedSessionModal;
