import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logAnalyticsEvent, AnalyticsEvents } from '../../../utils/analytics';

/**
 * Hook to automatically track page views in Firebase Analytics
 * Add this hook to your main App component or router
 */
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        logAnalyticsEvent(AnalyticsEvents.PAGE_VIEW, {
            page_path: location.pathname,
            page_location: window.location.href,
            page_title: document.title,
        });
    }, [location]);
};
