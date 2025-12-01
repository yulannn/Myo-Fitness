import React, { useState } from 'react';
import { useCreateSharedSession } from '../../api/hooks/shared-session/useSharedSessions';
import { X } from 'lucide-react';

interface CreateSharedSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateSharedSessionModal: React.FC<CreateSharedSessionModalProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [location, setLocation] = useState('Gym');
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
                setLocation('Gym');
                setMaxParticipants('');
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#252527] rounded-xl w-full max-w-md p-6 relative shadow-xl border border-gray-700">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Créer une séance partagée</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Une fois créée, vous pourrez inviter vos amis et groupes
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#121214] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Ex: Séance Jambes"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description (optionnel)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#121214] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Détails sur la séance..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Date et Heure</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-[#121214] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Lieu</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-[#121214] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Max Participants</label>
                            <input
                                type="number"
                                min="2"
                                value={maxParticipants}
                                onChange={(e) => setMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-[#121214] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Illimité"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createSession.isPending}
                        className="w-full bg-[#94fbdd] hover:bg-[#94fbdd]/80 text-[#121214] font-medium py-2 px-4 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createSession.isPending ? 'Création...' : 'Créer la séance'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSharedSessionModal;
