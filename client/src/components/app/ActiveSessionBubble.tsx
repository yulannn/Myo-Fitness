import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function ActiveSessionBubble() {
    const navigate = useNavigate();
    const location = useLocation();
    const [hasActiveSession, setHasActiveSession] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Vérifier s'il y a une session active
    useEffect(() => {
        const checkActiveSession = () => {
            const session = localStorage.getItem('activeSession');
            const startTime = localStorage.getItem('sessionStartTime');
            setHasActiveSession(!!(session && startTime));

            if (startTime) {
                setElapsedTime(Date.now() - parseInt(startTime));
            }
        };

        checkActiveSession();
        const interval = setInterval(checkActiveSession, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Ne pas afficher la bulle si on est déjà sur la page active-session
    if (!hasActiveSession || location.pathname === '/active-session') {
        return null;
    }

    return (
        <button
            onClick={() => navigate('/active-session')}
            className="fixed z-50 bottom-24 right-4 sm:right-6 group"
            aria-label="Retour à la session active"
        >
            {/* Effet de glow pulsant */}
            <div className="absolute inset-0 bg-[#94fbdd] rounded-full blur-xl opacity-50 group-hover:opacity-70 animate-pulse"></div>

            {/* Bulle principale */}
            <div className="relative bg-gradient-to-br from-[#94fbdd] to-[#72e8cc] rounded-full shadow-2xl shadow-[#94fbdd]/50 p-4 sm:p-5 transition-all group-hover:scale-110 group-active:scale-95">
                <PlayIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#121214] animate-pulse" />

                {/* Badge avec le temps */}
                <div className="absolute -top-2 -right-2 bg-[#121214] text-[#94fbdd] text-xs font-bold px-2 py-1 rounded-full border-2 border-[#94fbdd] shadow-lg min-w-[60px] text-center">
                    {formatTime(elapsedTime)}
                </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-[#252527] text-white text-xs font-medium px-3 py-2 rounded-xl shadow-xl border border-[#94fbdd]/20 whitespace-nowrap">
                    Session en cours
                </div>
            </div>
        </button>
    );
}
