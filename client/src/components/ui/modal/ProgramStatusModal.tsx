import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './index';
import { ArchiveBoxIcon, ArrowUturnLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProgramStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    program: any;
    activeProgram?: any;
    isPending: boolean;
}

export const ProgramStatusModal: React.FC<ProgramStatusModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    program,
    activeProgram,
    isPending
}) => {
    const isActivating = program.status !== 'ACTIVE';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className="max-w-md">
                <ModalHeader>
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isActivating ? 'bg-[#94fbdd]/10' : 'bg-yellow-500/10'} mb-4`}>
                        {isActivating ? (
                            <ArrowUturnLeftIcon className="h-6 w-6 text-[#94fbdd]" aria-hidden="true" />
                        ) : (
                            <ArchiveBoxIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />
                        )}
                    </div>
                    <ModalTitle className="text-center">
                        {isActivating ? 'Activer ce programme ?' : 'Archiver ce programme ?'}
                    </ModalTitle>
                </ModalHeader>

                <div className="mt-2 text-center">
                    <p className="text-sm text-gray-400">
                        {isActivating ? (
                            <>
                                Vous êtes sur le point d'activer <strong>{program.name}</strong>.
                                {activeProgram && (
                                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-left">
                                        <div className="flex gap-2">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                            <span className="text-yellow-200 text-xs">
                                                Attention : Le programme actuel <strong>{activeProgram.name}</strong> sera automatiquement archivé.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                Le programme <strong>{program.name}</strong> sera déplacé dans vos archives.
                                <br className="mb-2" />
                                Vous ne pourrez plus lancer de séances tant qu'il ne sera pas réactivé.
                            </>
                        )}
                    </p>
                </div>

                <ModalFooter className="sm:justify-center gap-3 mt-6">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-xl bg-[#252527] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700 sm:w-auto transition-colors"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        className={`inline-flex w-full justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto transition-all ${isActivating
                                ? 'bg-[#94fbdd] text-[#121214] hover:bg-[#94fbdd]/90 shadow-[#94fbdd]/20'
                                : 'bg-yellow-500 text-white hover:bg-yellow-400 shadow-yellow-500/20'
                            }`}
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            isActivating ? 'Confirmer l\'activation' : 'Confirmer l\'archivage'
                        )}
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
