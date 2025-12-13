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
            <ModalContent className="max-w-md mx-4">
                <ModalHeader>
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${isActivating ? 'bg-[#94fbdd]/10 border border-[#94fbdd]/20' : 'bg-[#94fbdd]/10 border border-[#94fbdd]/20'} mb-4`}>
                        {isActivating ? (
                            <ArrowUturnLeftIcon className="h-6 w-6 text-[#94fbdd]" aria-hidden="true" />
                        ) : (
                            <ArchiveBoxIcon className="h-6 w-6 text-[#94fbdd]" aria-hidden="true" />
                        )}
                    </div>
                    <ModalTitle className="text-center text-lg sm:text-xl">
                        {isActivating ? 'Activer ce programme ?' : 'Archiver ce programme ?'}
                    </ModalTitle>
                </ModalHeader>

                <div className="px-4 sm:px-6 pb-4">
                    <p className="text-sm sm:text-base text-gray-400 text-center leading-relaxed">
                        {isActivating ? (
                            <>
                                Vous êtes sur le point d'activer <strong className="text-white">{program.name}</strong>.
                                {activeProgram && (
                                    <div className="mt-4 p-3 bg-[#94fbdd]/10 border border-[#94fbdd]/20 rounded-lg text-left">
                                        <div className="flex gap-2">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-[#94fbdd] flex-shrink-0 mt-0.5" />
                                            <span className="text-[#94fbdd] text-xs sm:text-sm">
                                                Attention : Le programme actuel <strong>{activeProgram.name}</strong> sera automatiquement archivé.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                Le programme <strong className="text-white">{program.name}</strong> sera déplacé dans vos archives.
                                <br />
                                <span className="text-xs sm:text-sm">
                                    Vous ne pourrez plus lancer de séances tant qu'il ne sera pas réactivé.
                                </span>
                            </>
                        )}
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
                        className={`w-full sm:flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${isActivating
                            ? 'bg-[#94fbdd] text-[#121214] hover:bg-[#94fbdd]/90'
                            : 'bg-[#94fbdd] text-[#121214] hover:bg-[#94fbdd]/90'
                            }`}
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Traitement...</span>
                            </div>
                        ) : (
                            isActivating ? "Confirmer l'activation" : "Confirmer l'archivage"
                        )}
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
