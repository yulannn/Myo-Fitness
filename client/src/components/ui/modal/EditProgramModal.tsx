import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

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
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle smooth closing animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    // Update form when program changes
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className={`relative z-[100] w-full min-h-[50vh] max-h-[92vh] bg-[#252527] rounded-t-3xl shadow-2xl border-t border-x border-[#94fbdd]/10 flex flex-col transition-all duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
            >
                {/* Header */}
                <div className="flex-shrink-0 px-6 pt-6 pb-4">
                    {/* Drag Handle */}
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-[#94fbdd]/10 border border-[#94fbdd]/20">
                            <PencilSquareIcon className="h-5 w-5 text-[#94fbdd]" aria-hidden="true" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            Modifier le programme
                        </h2>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3">
                            <label htmlFor="name" className="text-sm font-medium text-gray-300">
                                Nom du programme
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all"
                                placeholder="Nom du programme"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3">
                            <label htmlFor="description" className="text-sm font-medium text-gray-300">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all h-32 resize-none"
                                placeholder="Description du programme..."
                                disabled={isPending}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 pb-6 pt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isPending}
                            className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm({ name, description })}
                            disabled={isPending || !name.trim()}
                            className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121214] border-t-transparent" />
                                    <span>Modification...</span>
                                </div>
                            ) : (
                                'Enregistrer les modifications'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
