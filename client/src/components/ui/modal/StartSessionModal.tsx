import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './index';
import { PlayIcon } from '@heroicons/react/24/outline';

interface StartSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    sessionDate?: string;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    sessionDate
}) => {
    const formatDate = (date: string | undefined) => {
        if (!date) return 'cette séance';
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className="max-w-md mx-4">
                <ModalHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#94fbdd]/10 border border-[#94fbdd]/20 mb-4">
                        <PlayIcon className="h-6 w-6 text-[#94fbdd]" aria-hidden="true" />
                    </div>
                    <ModalTitle className="text-center text-lg sm:text-xl">
                        Démarrer la séance ?
                    </ModalTitle>
                </ModalHeader>

                <div className="px-4 sm:px-6 pb-4">
                    <p className="text-sm sm:text-base text-gray-400 text-center leading-relaxed">
                        Vous allez commencer la séance {sessionDate && (
                            <>
                                du <strong className="text-white">{formatDate(sessionDate)}</strong>
                            </>
                        )}.
                        <br />
                        <span className="text-xs sm:text-sm">
                            Le chronomètre démarrera automatiquement.
                        </span>
                    </p>
                </div>

                <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        type="button"
                        className="w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-[#252527] text-white text-sm font-semibold hover:bg-[#2a2a2d] border border-white/10 transition-colors"
                        onClick={onClose}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-[#94fbdd] text-[#121214] text-sm font-semibold hover:bg-[#94fbdd]/90 transition-all"
                        onClick={onConfirm}
                    >
                        Démarrer la séance
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
