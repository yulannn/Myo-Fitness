import React, { useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isDeleting = false,
}) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div
                className={`relative z-[200] w-full max-w-md bg-[#1c1c1e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white text-center mb-2">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
                        {description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 rounded-xl bg-[#2c2c2e] text-white font-semibold border border-white/10 hover:bg-[#3a3a3c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Suppression...</span>
                                </div>
                            ) : (
                                'Supprimer'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
