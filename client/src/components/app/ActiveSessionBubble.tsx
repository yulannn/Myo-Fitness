import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlayIcon } from '@heroicons/react/24/solid';
import { usePerformanceStore } from '../../store/usePerformanceStore';
import { useAuth } from '../../context/AuthContext';

export default function ActiveSessionBubble() {
    const navigate = useNavigate();
    const location = useLocation();
    const [elapsedTime, setElapsedTime] = useState(0);

    // Vérifier si l'utilisateur est connecté
    const { isAuthenticated } = useAuth();

    // Utiliser le store unifi\u00e9 au lieu de localStorage
    const { activeSession, startTime } = usePerformanceStore();

    // Calculer le  temps \u00e9coul\u00e9
    useEffect(() => {
        if (startTime) {
            const interval = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [startTime]);

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} `;
    };

    // Ne pas afficher la bulle si :
    // - Pas de session active
    // - Utilisateur d\u00e9connect\u00e9 \u2705 NOUVELLE CONDITION
    // - D\u00e9j\u00e0 sur la page active-session
    if (!activeSession || !startTime || !isAuthenticated || location.pathname === '/active-session') {
        return null;
    }

    return (
        <button
            onClick={() => navigate('/active-session')}
            className="fixed z-50 bottom-24 right-4 sm:right-6 group"
            aria-label="Retour \u00e0 la session active"
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
