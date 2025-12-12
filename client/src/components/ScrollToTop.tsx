import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll #root to top (for mobile/PWA strict layout)
        const root = document.getElementById("root");
        if (root) {
            root.scrollTo(0, 0);
        }

        // Also try window scroll just in case
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
