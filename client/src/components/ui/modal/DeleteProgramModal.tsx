import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './index';
import { TrashIcon } from '@heroicons/react/24/outline';

interface DeleteProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    programName: string;
    isPending: boolean;
}

export const DeleteProgramModal: React.FC<DeleteProgramModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    programName,
    isPending
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className="max-w-md mx-4">
                <ModalHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                        <TrashIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
                    </div>
                    <ModalTitle className="text-center text-lg sm:text-xl">
                        Supprimer ce programme ?
                    </ModalTitle>
                </ModalHeader>

                <div className="px-4 sm:px-6 pb-4">
                    <p className="text-sm sm:text-base text-gray-400 text-center leading-relaxed">
                        Vous êtes sur le point de supprimer définitivement <strong className="text-white">{programName}</strong>.
                        <br />
                        <span className="text-xs sm:text-sm text-red-400 mt-2 block">
                            Cette action est irréversible et supprimera toutes les séances associées.
                        </span>
                    </p>
                </div>

                <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        type="button"
                        className="w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-[#252527] text-white text-sm font-semibold hover:bg-[#2a2a2d] border border-white/10 transition-colors disabled:opacity-50"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Suppression...</span>
                            </div>
                        ) : (
                            'Supprimer définitivement'
                        )}
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
