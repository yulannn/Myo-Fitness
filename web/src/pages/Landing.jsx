// ─────────────────────────────────────────────────────────────
// Landing – The original home page (extracted from App.jsx)
// ─────────────────────────────────────────────────────────────

import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Stats from '../components/Stats.jsx';
import Features from '../components/Features.jsx';
import Footer from '../components/Footer.jsx';
import LegalModal from '../components/LegalModal.jsx';
import ComingSoonModal from '../components/ComingSoonModal.jsx';

export default function Landing() {
  const [legalType, setLegalType] = React.useState(null);
  const [showComingSoon, setShowComingSoon] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary selection:text-background font-montserrat">
      <Navbar onOpenComingSoon={() => setShowComingSoon(true)} />
      <main>
        <Hero onOpenComingSoon={() => setShowComingSoon(true)} />
        <Stats />
        <Features />

        {/* Call to Action Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10"></div>
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
              Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">passer au niveau supérieur ?</span>
            </h2>
            <p className="text-text-secondary text-lg mb-12 max-w-2xl mx-auto">
              Rejoins la communauté Myo Fitness et commence ta transformation aujourd'hui.
              Disponible gratuitement sur iOS et Android.
            </p>
            <button
              onClick={() => setShowComingSoon(true)}
              className="px-12 py-5 bg-white text-background text-xl font-bold rounded-full hover:bg-primary hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20"
            >
              Commencer maintenant
            </button>
          </div>
        </section>
      </main>
      <Footer onOpenLegal={setLegalType} />

      {/* Legal Modal */}
      <LegalModal type={legalType} onClose={() => setLegalType(null)} />

      {/* Coming Soon Modal */}
      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
    </div>
  );
}
