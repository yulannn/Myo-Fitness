import React from 'react';

const stats = [
    { value: "500+", label: "Exercices Référencés" },
    { value: "1M+", label: "Séries Validées" },
    { value: "4.9/5", label: "Note Moyenne" },
];

export default function Stats() {
    return (
        <section className="py-12 border-y border-border-subtle bg-surface/30 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border-subtle">
                    {stats.map((stat, index) => (
                        <div key={index} className="pt-8 md:pt-0 px-4">
                            <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                            <p className="text-primary font-medium uppercase tracking-wider text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
