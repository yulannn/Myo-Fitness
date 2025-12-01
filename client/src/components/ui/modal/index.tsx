import * as React from "react";
import { clsx } from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={clsx(
                    "relative z-50 w-full max-w-lg",
                    "rounded-3xl bg-[#252527]",
                    "shadow-2xl border border-[#94fbdd]/10",
                    "max-h-[90vh]",
                    "flex flex-col"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors z-10"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>

                {children}
            </div>
        </div>
    );
};

export const ModalHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("px-6 pt-6 pb-4 flex-shrink-0", className)} {...props} />
);

export const ModalFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("px-6 pb-6 pt-4 flex-shrink-0", className)} {...props} />
);

export const ModalContent = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("px-6 py-2 overflow-y-auto flex-1", className)} {...props} />
);

export const ModalTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={clsx("text-2xl font-bold text-white text-center", className)}
        {...props}
    />
));

export const ModalDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={clsx("text-sm text-gray-400 text-center", className)}
        {...props}
    />
));
