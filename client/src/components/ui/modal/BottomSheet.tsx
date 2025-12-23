import * as React from "react";
import { useState, useEffect } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Reset position when closing
  useEffect(() => {
    if (!isOpen) {
      setCurrentY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - startY;

    // Only allow dragging down (positive deltaY)
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // If dragged more than 100px, close the modal
    if (currentY > 100) {
      onClose();
    } else {
      // Snap back to position
      setCurrentY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = e.clientY - startY;

    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    if (currentY > 100) {
      onClose();
    } else {
      setCurrentY(0);
    }
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, currentY]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{
          opacity: isDragging ? Math.max(0.3, 1 - currentY / 300) : 1
        }}
      />

      {/* Bottom Sheet */}
      <div
        className="relative z-[100] w-full bg-[#252527] rounded-t-3xl shadow-2xl border-t border-[#94fbdd]/10 flex flex-col max-h-[85vh]"
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const BottomSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 pt-4 pb-4 flex-shrink-0 ${className || ''}`} {...props} />
);

export const BottomSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 pb-6 pt-4 flex-shrink-0 border-t border-white/5 ${className || ''}`} {...props} />
);

export const BottomSheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-2xl font-bold text-white text-center ${className || ''}`}
    {...props}
  />
));
