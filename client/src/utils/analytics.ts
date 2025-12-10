import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../config/firebase';

/**
 * Log a custom event to Firebase Analytics
 * @param eventName - The name of the event
 * @param eventParams - Optional parameters for the event
 */
export const logAnalyticsEvent = (
    eventName: string,
    eventParams?: Record<string, any>
) => {
    if (analytics) {
        logEvent(analytics, eventName, eventParams);
    }
};

/**
 * Set the user ID for Analytics
 * @param userId - The user ID to set
 */
export const setAnalyticsUserId = (userId: string | null) => {
    if (analytics && userId) {
        setUserId(analytics, userId);
    }
};

/**
 * Set user properties for Analytics
 * @param properties - User properties to set
 */
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
    if (analytics) {
        setUserProperties(analytics, properties);
    }
};

// Pre-defined events for common actions in your app
export const AnalyticsEvents = {
    // User actions
    USER_LOGIN: 'user_login',
    USER_SIGNUP: 'user_signup',
    USER_LOGOUT: 'user_logout',

    // Workout events
    WORKOUT_STARTED: 'workout_started',
    WORKOUT_COMPLETED: 'workout_completed',
    WORKOUT_SHARED: 'workout_shared',

    // Session events
    SESSION_CREATED: 'session_created',
    SESSION_JOINED: 'session_joined',

    // Program events
    PROGRAM_CREATED: 'program_created',
    PROGRAM_STARTED: 'program_started',

    // Social events
    FRIEND_ADDED: 'friend_added',
    GROUP_CREATED: 'group_created',
    MESSAGE_SENT: 'message_sent',

    // Premium events
    PREMIUM_UPGRADE: 'premium_upgrade',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',

    // XP events
    XP_GAINED: 'xp_gained',
    LEVEL_UP: 'level_up',

    // Page views
    PAGE_VIEW: 'page_view',
} as const;
