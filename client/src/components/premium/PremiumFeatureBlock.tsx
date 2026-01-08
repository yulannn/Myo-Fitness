import { SparklesIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface PremiumFeatureBlockProps {
  featureName: string;
  description: string;
  benefits?: string[];
  onClose?: () => void;
}

/**
 * Composant pour afficher un paywall premium quand un utilisateur free
 * essaie d'accéder à une fonctionnalité premium
 */
export const PremiumFeatureBlock = ({
  featureName,
  description,
  benefits = [
    'Programmes générés par IA personnalisés',
    'Analyses avancées de performance',
    'Accès illimité à toutes les fonctionnalités',
    'Support prioritaire'
  ],
  onClose
}: PremiumFeatureBlockProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose?.();
    // TODO: Navigate to pricing/subscription page
    navigate('/settings'); // Placeholder
  };

  return (
    <div className="absolute inset-0 bg-[#121214]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 rounded-2xl">
      <div className="max-w-md w-full">
        {/* Premium Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#94fbdd] to-[#7de0c4] rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative p-4 bg-gradient-to-br from-[#94fbdd]/20 to-[#7de0c4]/10 rounded-2xl border border-[#94fbdd]/30">
              <LockClosedIcon className="h-12 w-12 text-[#94fbdd]" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <SparklesIcon className="h-5 w-5 text-[#94fbdd]" />
            <h3 className="text-2xl font-bold text-white">
              Fonctionnalité Premium
            </h3>
          </div>
          <p className="text-lg font-semibold text-[#94fbdd] mb-3">
            {featureName}
          </p>
          <p className="text-sm text-gray-400">
            {description}
          </p>
        </div>

        {/* Benefits List */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Avec Premium, vous débloquez :
          </p>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-[#94fbdd] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#94fbdd] to-[#7de0c4] text-[#121214] font-bold rounded-xl shadow-lg shadow-[#94fbdd]/30 hover:shadow-[#94fbdd]/50 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <SparklesIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Passer à Premium
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors"
            >
              Peut-être plus tard
            </button>
          )}
        </div>

        {/* Small print */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Vous pouvez toujours créer des programmes manuellement gratuitement
        </p>
      </div>
    </div>
  );
};
