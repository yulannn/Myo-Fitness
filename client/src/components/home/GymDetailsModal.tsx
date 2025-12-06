import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserGroupIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useGymDetails } from '../../api/hooks/gym/useGymDetails';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GymDetailsModalProps {
    gymId: number | null;
    gymName?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function GymDetailsModal({ gymId, gymName, isOpen, onClose }: GymDetailsModalProps) {
    const { data: gymDetails, isLoading } = useGymDetails(gymId);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[#1a1a1c] border border-[#94fbdd]/20 p-6 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
                                                <MapPinIcon className="h-6 w-6 text-[#94fbdd]" />
                                            </div>
                                            <Dialog.Title className="text-2xl font-bold text-white">
                                                {gymDetails?.name || gymName || 'Détails de la salle'}
                                            </Dialog.Title>
                                        </div>
                                        {gymDetails?.address && (
                                            <p className="text-sm text-gray-400 ml-14">{gymDetails.address}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                                    </button>
                                </div>

                                {/* Loading */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#94fbdd]/30 border-t-[#94fbdd]" />
                                    </div>
                                )}

                                {/* Content */}
                                {!isLoading && gymDetails && (
                                    <div className="space-y-6">
                                        {/* Membres */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <UserGroupIcon className="h-5 w-5 text-[#94fbdd]" />
                                                <h3 className="text-lg font-semibold text-white">
                                                    Membres ({gymDetails.members.length})
                                                </h3>
                                            </div>

                                            {gymDetails.members.length === 0 ? (
                                                <div className="bg-[#252527] rounded-xl p-6 text-center">
                                                    <p className="text-gray-400 text-sm">Aucun membre enregistré dans cette salle</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {gymDetails.members.map((member) => (
                                                        <div
                                                            key={member.id}
                                                            className="bg-[#252527] rounded-xl p-3 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {member.profilePictureUrl ? (
                                                                    <img
                                                                        src={member.profilePictureUrl}
                                                                        alt={member.name}
                                                                        className="w-10 h-10 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-[#94fbdd]/10 flex items-center justify-center">
                                                                        <span className="text-[#94fbdd] font-semibold">
                                                                            {member.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                                                                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Séances partagées uniquement */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-5 w-5 text-[#94fbdd]" />
                                                <h3 className="text-lg font-semibold text-white">
                                                    Séances planifiées ({gymDetails.sessions.length})
                                                </h3>
                                            </div>

                                            {gymDetails.sessions.length === 0 ? (
                                                <div className="bg-[#252527] rounded-xl p-6 text-center">
                                                    <p className="text-gray-400 text-sm">Aucune séance planifiée dans cette salle</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                                    {gymDetails.sessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="bg-[#252527] rounded-xl p-4 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {/* Avatar de l'organisateur */}
                                                                {session.user.profilePictureUrl ? (
                                                                    <img
                                                                        src={session.user.profilePictureUrl}
                                                                        alt={session.user.name}
                                                                        className="w-10 h-10 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-purple-400 font-semibold">
                                                                            {session.user.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {/* Info de la séance */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-white mb-1">
                                                                        {session.title}
                                                                    </p>

                                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                                                                        <div className="flex items-center gap-1">
                                                                            <CalendarIcon className="h-3.5 w-3.5" />
                                                                            <span>
                                                                                {format(new Date(session.startTime), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                                                            </span>
                                                                        </div>

                                                                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
                                                                            Séance partagée
                                                                        </span>
                                                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                                                                            {session.participantsCount} participant{session.participantsCount > 1 ? 's' : ''}
                                                                        </span>
                                                                        {session.maxParticipants && (
                                                                            <span className="text-gray-500">
                                                                                (max: {session.maxParticipants})
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {session.description && (
                                                                        <p className="text-xs text-gray-400 mt-2">{session.description}</p>
                                                                    )}
                                                                </div>

                                                                {/* Status */}
                                                                <div>
                                                                    {session.completed ? (
                                                                        <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                                                                            Terminé
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                            À venir
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>

                <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a1a1c;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #94fbdd;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #7CD8EE;
          }
        `}</style>
            </Dialog>
        </Transition>
    );
}
