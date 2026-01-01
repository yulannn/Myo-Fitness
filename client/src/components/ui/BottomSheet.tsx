import { useRef, useState, useCallback, useEffect } from 'react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

/**
 * 🎯 Bottom Sheet avec swipe-to-close
 * - Prend toute la largeur/hauteur avec espace en haut
 * - Handle (tiret) pour indiquer le swipe
 * - Se ferme en glissant vers le bas
 */
export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const startY = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Seuil pour fermer (en pixels)
    const CLOSE_THRESHOLD = 100;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setIsDragging(true);
        startY.current = e.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        // Seulement permettre le glissement vers le bas
        if (diff > 0) {
            setDragOffset(diff);
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        if (dragOffset > CLOSE_THRESHOLD) {
            onClose();
        }
        setDragOffset(0);
    }, [dragOffset, onClose]);

    // Reset offset quand on ferme
    useEffect(() => {
        if (!isOpen) {
            setDragOffset(0);
        }
    }, [isOpen]);

    // Empêcher le scroll du body quand ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                style={{
                    opacity: Math.max(0, 1 - dragOffset / 300),
                }}
            />

            {/* Espace en haut */}
            <div className="h-12 flex-shrink-0" onClick={onClose} />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className="relative flex-1 bg-[#18181b] rounded-t-3xl overflow-hidden flex flex-col"
                style={{
                    transform: `translateY(${dragOffset}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
            >
                {/* Handle Zone (swipeable) */}
                <div
                    className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Handle visuel */}
                    <div className="w-10 h-1 bg-gray-500 rounded-full mx-auto" />
                </div>

                {/* Title */}
                {title && (
                    <div className="px-5 pb-4 border-b border-white/5">
                        <h3 className="text-lg font-semibold text-white text-center">
                            {title}
                        </h3>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default BottomSheet;
