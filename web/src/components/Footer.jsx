import React from 'react';
import { BoltIcon } from '@heroicons/react/24/outline';

export default function Footer({ onOpenLegal }) {
    return (
        <footer className="bg-surface py-12 border-t border-border-subtle">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <BoltIcon className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold font-montserrat text-white">
                                MYO <span className="text-primary">FITNESS</span>
                            </span>
                        </div>
                        <p className="text-text-secondary max-w-sm">
                            L'application de fitness qui allie intelligence artificielle et design premium pour transformer votre entraînement.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Produit</h4>
                        <ul className="space-y-4 text-text-secondary">
                            <li><a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                            <li><a href="#download" className="hover:text-primary transition-colors">Télécharger</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Légal</h4>
                        <ul className="space-y-4 text-text-secondary">
                            <li>
                                <button onClick={() => onOpenLegal('privacy')} className="hover:text-primary transition-colors text-left">
                                    Confidentialité
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onOpenLegal('terms')} className="hover:text-primary transition-colors text-left">
                                    CGU
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onOpenLegal('contact')} className="hover:text-primary transition-colors text-left">
                                    Contact
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
                    <p>© 2026 Myo Fitness. Tous droits réservés.</p>

                </div>
            </div>
        </footer>
    );
}
