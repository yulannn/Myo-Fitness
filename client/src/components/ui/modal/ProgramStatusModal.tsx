import React from 'react';
import { Modal, ModalContent } from './index';
import { ArchiveBoxIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm bg-[#18181b] border border-white/10 rounded-2xl">
            <ModalContent className="!p-0 overflow-visible">
                <div className="p-5">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className={`p-3 rounded-full ${isActivating ? 'bg-[#94fbdd]/10' : 'bg-gray-500/10'}`}>
                            {isActivating ? (
                                <ArrowUturnLeftIcon className="h-6 w-6 text-[#94fbdd]" />
                            ) : (
                                <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-white">
                                {isActivating ? 'Activer le programme' : 'Archiver le programme'}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {isActivating ? (
                                    <>
                                        Activer <span className="text-white font-medium">"{program.name}"</span> ?
                                        {activeProgram && (
                                            <span className="block mt-1 text-xs text-[#94fbdd]">
                                                (Archivera "{activeProgram.name}")
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        Archiver <span className="text-white font-medium">"{program.name}"</span> ?
                                    </>
                                )}
                            </p>
                        </div>
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
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                                ${isActivating
                                    ? 'bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] shadow-lg shadow-[#94fbdd]/20'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {isPending ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>Traitement...</span>
                                </>
                            ) : (
                                isActivating ? 'Activer' : 'Archiver'
                            )}
                        </button>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
};
