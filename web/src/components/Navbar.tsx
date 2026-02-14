import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onOpenComingSoon }) {
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initials for avatar
    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '';

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border-subtle py-4' : 'bg-transparent py-6'
            }`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <BoltIcon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold font-montserrat text-white tracking-wide">
                        MYO <span className="text-primary">FITNESS</span>
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        /* ── Authenticated: avatar + go to dashboard ─── */
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 group"
                        >
                            {user?.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt={user.name}
                                    className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/30"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                                    <span className="text-primary text-xs font-bold">{initials}</span>
                                </div>
                            )}
                            <span className="hidden sm:inline text-sm font-semibold text-white group-hover:text-primary transition-colors">
                                Mon espace
                            </span>
                        </Link>
                    ) : (
                        /* ── Not authenticated: login + download CTA ── */
                        <>
                            <Link
                                to="/login"
                                className="px-5 py-2.5 text-sm font-semibold text-white hover:text-primary transition-colors duration-200"
                            >
                                Connexion
                            </Link>
                            <button
                                onClick={onOpenComingSoon}
                                className="hidden sm:block px-6 py-2.5 bg-primary text-background font-semibold rounded-xl hover:bg-primary-70 transition-all duration-300 hover:shadow-[0_0_20px_rgba(148,251,221,0.3)] transform hover:-translate-y-0.5"
                            >
                                Télécharger l'app
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
