import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './index';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface EditProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { name: string; description: string }) => void;
    program: { name: string; description?: string };
    isPending: boolean;
}

export const EditProgramModal: React.FC<EditProgramModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    program,
    isPending
}) => {
    const [name, setName] = useState(program.name);
    const [description, setDescription] = useState(program.description || '');

    useEffect(() => {
        if (isOpen) {
            setName(program.name);
            setDescription(program.description || '');
        }
    }, [isOpen, program]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ name, description });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showClose={false}>
            <ModalContent className="max-w-sm mx-auto">
                <ModalHeader className="pb-0">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-[#94fbdd]/10 border border-[#94fbdd]/20">
                            <PencilSquareIcon className="h-5 w-5 text-[#94fbdd]" aria-hidden="true" />
                        </div>
                        <ModalTitle className="text-left text-lg whitespace-nowrap">
                            Modifier le programme
                        </ModalTitle>
                    </div>
                </ModalHeader>

                <form onSubmit={handleSubmit} className="px-6 pt-4 pb-2 space-y-3">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-medium text-gray-300">
                            Nom du programme
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg bg-[#252527] border border-white/10 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                            placeholder="Nom du programme"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="description" className="text-sm font-medium text-gray-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg bg-[#252527] border border-white/10 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all h-20 resize-none"
                            placeholder="Description du programme..."
                            disabled={isPending}
                        />
                    </div>
                </form>

                <ModalFooter className="px-6 pb-6 pt-2 flex-col sm:flex-row gap-2 sm:gap-3">
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
                        className="w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-[#94fbdd] text-[#121214] text-sm font-semibold hover:bg-[#94fbdd]/90 transition-all disabled:opacity-50"
                        onClick={() => onConfirm({ name, description })}
                        disabled={isPending || !name.trim()}
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Modification...</span>
                            </div>
                        ) : (
                            'Enregistrer'
                        )}
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
