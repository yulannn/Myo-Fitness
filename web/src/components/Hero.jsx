import React from 'react';
import mockup from '../assets/mockup.png';

export default function Hero({ onOpenComingSoon }) {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden" id="download">
            {/* Background Gradient Blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

                {/* Text Content */}
                <div className="space-y-8 z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                        Transforme ton corps, <br />
                        <span className="text-gradient">transforme ta vie.</span>
                    </h1>
                    <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
                        Plus qu'une application de sport. Un coach intelligent qui s'adapte à ta progression et te pousse à dépasser tes limites.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onOpenComingSoon}
                            className="px-8 py-4 bg-primary text-background text-lg font-bold rounded-xl hover:bg-primary-70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-glow flex items-center justify-center gap-3"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.23-3.14-2.47-1.72-2.58-2.92-7.35-.41-10.74 1.24-1.68 3.48-2.52 5.3-2.43 1.5.12 2.65.84 3.4.84.77 0 2.22-1.03 3.73-.88 1.27.13 2.4.65 3.1 1.66-2.73 1.66-2.27 6.13.41 7.23-.21 1.26-.97 3.17-1.85 4.54l-.93-.25zm-2.99-15.01c.72-1.25 1.13-2.58 1.13-3.87-1.29.13-2.82.89-3.76 1.88-.78.83-1.46 2.15-1.29 3.41 1.43.11 2.96-.58 3.92-1.42z" /></svg>
                            App Store
                        </button>
                        <button
                            onClick={onOpenComingSoon}
                            className="px-8 py-4 bg-surface-card border border-border-subtle hover:border-border-accent text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.3,10.84L17.3,12.6L14.54,11.15L17.3,8.4L20.3,10.16C21.24,10.7 21.24,11.3 20.3,11.84M13.69,12L3.84,2.15L16.81,8.88L14.54,11.15L13.69,12Z" /></svg>
                            Google Play
                        </button>
                    </div>

                    <div className="pt-8 flex items-center gap-4 text-text-secondary text-sm">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full bg-surface-card border-2 border-background flex items-center justify-center text-xs text-white">
                                    {/* Placeholder for user avatars */}
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <p>Rejoins <span className="text-white font-bold">10,000+</span> athlètes</p>
                    </div>
                </div>

                {/* Mockup */}
                <div className="relative z-10 flex justify-center lg:justify-end animate-fade-in-up">
                    {/* Secondary Mockup (Behind) */}
                    <div className="absolute top-12 right-0 md:-right-4 w-[280px] md:w-[320px] aspect-[9/19] rounded-[3rem] border-8 border-surface-card bg-surface shadow-xl -z-10 opacity-40 rotate-6 hidden md:block border-opacity-50">
                        {/* Fake Content for blur effect */}
                        <div className="w-full h-full bg-surface-card/50"></div>
                    </div>

                    <div className="relative w-[300px] md:w-[350px] aspect-[9/19] rounded-[3rem] border-8 border-surface-card bg-surface shadow-2xl overflow-hidden ring-1 ring-white/10">


                        <img src={mockup} alt="App Interface" className="w-full h-full object-cover" />

                        {/* Home Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full z-20"></div>
                    </div>

                    {/* Floating elements */}
                    <div className="absolute top-1/4 -left-12 glass-card p-4 rounded-xl animate-float hidden md:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                🔥
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Calories</p>
                                <p className="font-bold text-white">563 kCal</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-1/4 -right-8 glass-card p-4 rounded-xl animate-float-delayed hidden md:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                💪
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Progression</p>
                                <p className="font-bold text-white">+12% cette semaine</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
