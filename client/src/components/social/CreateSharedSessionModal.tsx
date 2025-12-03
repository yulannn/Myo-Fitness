import React, { useState } from 'react';
import { useCreateSharedSession } from '../../api/hooks/shared-session/useSharedSessions';
import { XMarkIcon, UsersIcon, MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface CreateSharedSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateSharedSessionModal: React.FC<CreateSharedSessionModalProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxParticipants, setMaxParticipants] = useState<number | ''>('');

    const createSession = useCreateSharedSession();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startTime) return;

        createSession.mutate({
            title,
            description,
            startTime: new Date(startTime).toISOString(),
            location,
            maxParticipants: maxParticipants === '' ? undefined : Number(maxParticipants),
        }, {
            onSuccess: () => {
                onClose();
                // Reset form
                setTitle('');
                setDescription('');
                setStartTime('');
                setLocation('');
                setMaxParticipants('');
            }
        });
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setStartTime('');
        setLocation('');
        setMaxParticipants('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#252527] p-6 shadow-2xl border border-[#94fbdd]/20 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#94fbdd]/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#94fbdd]/40">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <UsersIcon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                Créer une séance partagée
                            </h3>
                            <p className="text-sm text-gray-400 mt-0.5">
                                Invitez vos amis à s'entraîner ensemble
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#121214] rounded-lg"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Titre <span className="text-purple-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-xl bg-[#121214] border border-purple-500/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                            placeholder="Ex: Séance Jambes Intense"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Description (optionnel)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-xl bg-[#121214] border border-purple-500/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all min-h-[100px] resize-none"
                            placeholder="Détails sur la séance, niveau requis, matériel nécessaire..."
                            rows={3}
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-purple-400" />
                            Date et Heure <span className="text-purple-400">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full rounded-xl bg-[#121214] border border-purple-500/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all [color-scheme:dark]"
                            required
                        />
                    </div>

                    {/* Location and Max Participants */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-purple-400" />
                                Lieu
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full rounded-xl bg-[#121214] border border-purple-500/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                placeholder="Gym, Parc..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <UsersIcon className="h-4 w-4 text-purple-400" />
                                Max Participants
                            </label>
                            <input
                                type="number"
                                min="2"
                                value={maxParticipants}
                                onChange={(e) => setMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full rounded-xl bg-[#121214] border border-purple-500/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                placeholder="Illimité"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 rounded-xl border border-purple-500/20 bg-transparent px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-[#121214] transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={createSession.isPending}
                            className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-purple-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createSession.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Création...
                                </span>
                            ) : (
                                'Créer la séance'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSharedSessionModal;
