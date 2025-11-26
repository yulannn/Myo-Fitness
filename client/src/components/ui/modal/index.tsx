// ...existing code...
import * as React from "react";
import { clsx } from "clsx";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xxs"
                onClick={onClose}
            />


            <div
                className={clsx(
                    "relative z-50 w-[92%] max-w-lg my-auto",
                    "rounded-2xl bg-white",
                    "shadow-2xl ring-1 ring-black/5",
                    "max-h-[calc(100vh-4rem)]",
                    "flex flex-col"
                )}
            >
                {children}
            </div>
        </div>
    );
};

export const ModalHeader = ({

    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("flex flex-col text-center space-y-1.5 px-6 pt-6 pb-2 text-indigo-500 flex-shrink-0", className)} {...props} />
);

export const ModalFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("px-6 pb-6 pt-4 flex flex-col space-y-2 text-indigo-500 flex-shrink-0", className)} {...props} />
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
        className={clsx("text-lg font-semibold text-indigo-500 m-auto", className)}
        {...props}
    />
));

export const ModalDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={clsx("text-sm text-indigo-500 dark:text-neutral-400", className)}
        {...props}
    />
));
