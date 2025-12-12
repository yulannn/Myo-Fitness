/**
 * Hook personnalisé pour empêcher le "rubber-band" / bouncing sur iOS
 * S'assure que le scroll n'est actif que sur les conteneurs scrollables
 */
import { useEffect } from 'react';

export const useIOSBounceFix = () => {
    useEffect(() => {
        // Vérifier si c'est un appareil iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        if (!isIOS) return;

        let startY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const target = e.target as HTMLElement;

            // Trouver l'ancêtre scrollable le plus proche
            let scrollableParent: HTMLElement | null = null;
            let el: HTMLElement | null = target;

            while (el && el !== document.body) {
                const style = window.getComputedStyle(el);
                const overflowY = style.overflowY;
                const isScrollableVal = overflowY === 'auto' || overflowY === 'scroll';
                const canScroll = el.scrollHeight > el.clientHeight;

                if (isScrollableVal && canScroll) {
                    scrollableParent = el;
                    break;
                }
                el = el.parentElement;
            }

            // Si pas de parent scrollable, on empêche le scroll
            if (!scrollableParent) {
                e.preventDefault();
                return;
            }

            // Si on a un parent scrollable, on doit vérifier les bords
            const y = e.touches[0].clientY;
            const dy = y - startY;
            const isUp = dy > 0;
            const isDown = dy < 0;

            const isAtTop = scrollableParent.scrollTop <= 0;
            const isAtBottom = scrollableParent.scrollTop + scrollableParent.clientHeight >= scrollableParent.scrollHeight;

            if (isAtTop && isUp) {
                // On est en haut et on tire vers le bas -> ça ferait bouncer le body
                e.preventDefault();
            } else if (isAtBottom && isDown) {
                // On est en bas et on tire vers le haut -> ça ferait bouncer le body
                e.preventDefault();
            }
            // Sinon on laisse faire le scroll naturel du conteneur
        };

        const options = { passive: false };

        document.addEventListener('touchstart', handleTouchStart, options as any);
        document.addEventListener('touchmove', handleTouchMove, options as any);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart, options as any);
            document.removeEventListener('touchmove', handleTouchMove, options as any);
        };
    }, []);
};
