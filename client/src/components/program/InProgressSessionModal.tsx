import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, PlayIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Modal, ModalContent } from '../ui/modal';
import useDeleteSession from '../../api/hooks/session/useDeleteSession';
import { usePerformanceStore } from '../../stores/usePerformanceStore';

interface InProgressSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: {
        id: number;
        sessionName: string | null;
        trainingProgram?: {
            name: string;
        };
        exercices?: Array<{
            id: number;
            exercice: {
                name: string;
            };
            performances?: Array<{
                set_index: number;
                success?: boolean;
            }>;
        }>;
        sessionTemplate?: {
            name: string;
        };
        _count?: {
            exercices: number;
        };
        updatedAt?: string;
    } | null;
}

export const InProgressSessionModal = ({ isOpen, onClose, session }: InProgressSessionModalProps) => {
    const navigate = useNavigate();
    const { mutate: deleteSession, isPending: isCancelling } = useDeleteSession();
    const { clearSession } = usePerformanceStore();
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);

    if (!session) return null;

    const sessionName = session.sessionName || session.sessionTemplate?.name || 'Séance sans nom';
    const programName = session.trainingProgram?.name || 'Programme';
    const exerciseCount = session._count?.exercices || session.exercices?.length || 0;

    // Calculer le nombre de sets validés
    const validatedSets = session.exercices?.reduce((total, ex) => {
        const validated = ex.performances?.filter(p => p.success)?.length || 0;
        return total + validated;
    }, 0) || 0;

    // Formater la date de dernière mise à jour
    const formatLastUpdate = (dateString?: string) => {
        if (!dateString) return 'Récemment';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    };

    const handleResume = () => {
        // Naviguer vers la page active-session avec l'ID de la session
        navigate(`/active-session?sessionId=${session.id}`);
        onClose();
    };

    const handleCancel = () => {
        deleteSession(session.id, {
            onSuccess: () => {
                clearSession(); // 🧹 Nettoyer le store Zustand pour faire disparaître la bulle flottante
                setShowConfirmCancel(false);
                onClose();
            },
            onError: (error) => {
                console.error('Erreur lors de l\'annulation:', error);
                // Fermer quand même la modal en cas d'erreur
                setShowConfirmCancel(false);
                onClose();
            }
        });
    };

    if (showConfirmCancel) {
        return (
            <Modal isOpen={isOpen} onClose={() => setShowConfirmCancel(false)} preventClose className="max-w-sm bg-[#18181b] border border-white/10 rounded-2xl">
                <ModalContent className="!p-0 overflow-visible">
                    <div className="p-5">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-red-500/10 rounded-full">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-white">
                                    Annuler la séance ?
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Toutes vos performances ({validatedSets} séries validées) seront perdues. La séance sera remise en attente.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                                onClick={() => setShowConfirmCancel(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                            >
                                Retour
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isCancelling ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Annulation...
                                    </>
                                ) : (
                                    'Confirmer'
                                )}
                            </button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} preventClose className="max-w-sm bg-[#18181b] border border-white/10 rounded-2xl">
            <ModalContent className="!p-0 overflow-visible">
                <div className="p-5">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center gap-3 mb-6">
                        <div className="p-3 bg-[#94fbdd]/10 rounded-full animate-pulse">
                            <ClockIcon className="h-6 w-6 text-[#94fbdd]" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-white">
                                Séance en cours détectée
                            </h3>
                            <p className="text-sm text-gray-400">
                                Vous avez une séance non terminée
                            </p>
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="bg-[#252527] p-4 rounded-xl border border-white/5 mb-6">
                        <h4 className="font-semibold text-white mb-1">{sessionName}</h4>
                        <p className="text-xs text-gray-500 mb-3">{programName}</p>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}</span>
                            <span className="text-[#94fbdd] font-medium">{validatedSets} série{validatedSets > 1 ? 's' : ''} validée{validatedSets > 1 ? 's' : ''}</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {formatLastUpdate(session.updatedAt)}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <button
                            onClick={handleResume}
                            className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#94fbdd]/20"
                        >
                            <PlayIcon className="w-4 h-4" />
                            Reprendre la séance
                        </button>

                        <button
                            onClick={() => setShowConfirmCancel(true)}
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Annuler et recommencer
                        </button>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
};

export default InProgressSessionModal;
