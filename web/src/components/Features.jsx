import React from 'react';
import { SparklesIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline';

const features = [
    {
        title: "Programmes IA",
        description: "Des entraînements générés sur mesure par l'intelligence artificielle selon ton niveau et tes objectifs.",
        icon: SparklesIcon,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Suivi de Progression",
        description: "Visualise tes progrès avec des graphiques détaillés. Poids, mensurations, et charges soulevées.",
        icon: ChartBarIcon,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    {
        title: "Records Personnels",
        description: "Célèbre chaque victoire. L'application enregistre automatiquement tes meilleurs performances.",
        icon: TrophyIcon,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
    },
];

export default function Features() {
    return (
        <section className="py-24 bg-background relative" id="features">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Plus qu'un simple <span className="text-gradient">carnet d'entraînement</span>
                    </h2>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        Une suite d'outils puissants conçus pour les athlètes exigeants qui veulent optimiser chaque séance.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl bg-surface-card border border-border-subtle hover:border-border-accent transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-glow"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-8 h-8 ${feature.color}`} />
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>

                            <p className="text-text-secondary leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
