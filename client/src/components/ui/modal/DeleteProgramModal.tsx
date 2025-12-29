import React from 'react';
import { Modal, ModalContent } from './index';
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm bg-[#18181b] border border-white/10 rounded-2xl">
            <ModalContent className="!p-0 overflow-visible">
                <div className="p-5">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-red-500/10 rounded-full">
                            <TrashIcon className="h-6 w-6 text-red-500" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-white">
                                Supprimer le programme
                            </h3>
                            <p className="text-sm text-gray-400">
                                Êtes-vous sûr de vouloir supprimer <span className="text-white font-medium">"{programName}"</span> ?
                            </p>
                        </div>

                        <p className="text-xs text-red-400/80 bg-red-500/5 px-3 py-1.5 rounded-md border border-red-500/10">
                            Cette action est irréversible.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Suppression...</span>
                                </>
                            ) : (
                                'Supprimer'
                            )}
                        </button>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
};
