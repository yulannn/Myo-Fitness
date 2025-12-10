// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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

// Initialize Analytics only in browser environment
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { app, analytics };
