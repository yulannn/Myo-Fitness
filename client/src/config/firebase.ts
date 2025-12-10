// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAzdQZqGpzdCviu4zmSaML3lCs5Wot9IMs",
    authDomain: "myo-fitness.firebaseapp.com",
    projectId: "myo-fitness",
    storageBucket: "myo-fitness.firebasestorage.app",
    messagingSenderId: "661048200526",
    appId: "1:661048200526:web:6301315012eca99483a21f",
    measurementId: "G-RHF4RK34CZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics lazily - only after DOM is ready and in browser environment
let analytics: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Get Analytics instance - initializes lazily when first called
 * This prevents the "appendChild" error by waiting for the DOM
 */
export const getAnalyticsInstance = async (): Promise<Analytics | null> => {
    // Return cached instance if already initialized
    if (analytics) return analytics;

    // Return existing promise if initialization is in progress
    if (analyticsPromise) return analyticsPromise;

    // Only initialize in browser environment
    if (typeof window === 'undefined') return null;

    analyticsPromise = (async () => {
        try {
            // Check if analytics is supported (also waits for DOM in some cases)
            const supported = await isSupported();
            if (!supported) {
                console.warn('Firebase Analytics is not supported in this environment');
                return null;
            }

            // Wait for document to be ready if needed
            if (document.readyState !== 'complete') {
                await new Promise<void>((resolve) => {
                    window.addEventListener('load', () => resolve(), { once: true });
                });
            }

            analytics = getAnalytics(app);
            return analytics;
        } catch (error) {
            console.warn('Failed to initialize Firebase Analytics:', error);
            return null;
        }
    })();

    return analyticsPromise;
};

export { app, analytics };
