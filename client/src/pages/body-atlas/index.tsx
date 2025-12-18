import { useBodyAtlas } from '../../api/hooks/body-atlas/useBodyAtlas';
import { useBodyAtlasStore } from '../../store/useBodyAtlasStore';
import { MuscleHeat, MuscleCategory } from '../../types/body-atlas.type';
import { Flame, Snowflake, Zap, TrendingUp, Trophy, Target, Activity, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function BodyAtlasPage() {
    const { data, isLoading, error } = useBodyAtlas();
    const { atlasData } = useBodyAtlasStore();

    // Utiliser les données du store si disponibles, sinon celles de la query
    const displayData = data || atlasData;

    if (isLoading && !displayData) {
        return <BodyAtlasSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#121214]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                        <Zap className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
                    <p className="text-gray-400">{(error as Error).message}</p>
                </div>
            </div>
        );
    }

    if (!displayData) {
        return null;
    }

    const hasData = displayData.muscleStats.some(s => s.totalVolume > 0);

    // Regrouper les muscles par catégorie
    const musclesByCategory = displayData.muscleStats.reduce((acc, stat) => {
        const category = stat.muscleGroup?.category || 'OTHER';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(stat);
        return acc;
    }, {} as Record<MuscleCategory, any[]>);

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#94fbdd]/10 via-[#18181b] to-[#18181b] border border-white/5 p-8"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#94fbdd]/5 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-[#94fbdd]/10 rounded-xl">
                                <Activity className="w-6 h-6 text-[#94fbdd]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Body Atlas
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Ta cartographie musculaire complète
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Scores Grid */}
                {hasData && (
                    <div className="grid grid-cols-2 gap-4">
                        <ScoreCard
                            title="Score Global"
                            value={displayData.overallScore}
                            icon={<TrendingUp className="w-5 h-5" />}
                            color="#94fbdd"
                            delay={0.1}
                        />
                        <ScoreCard
                            title="Équilibre"
                            value={displayData.balanceScore}
                            icon={<Target className="w-5 h-5" />}
                            color="#a78bfa"
                            delay={0.2}
                        />
                    </div>
                )}

                {/* Muscle Groups by Category */}
                <div className="space-y-4">
                    {Object.entries(musclesByCategory).map(([category, muscles], index) => (
                        <CategorySection
                            key={category}
                            category={category as MuscleCategory}
                            muscles={muscles}
                            delay={index * 0.05}
                        />
                    ))}
                </div>

                {/* Dominant vs Weak Section */}
                {hasData && (
                    <div className="grid grid-cols-2 gap-4">
                        <DominantWeakCard
                            title="💪 Dominants"
                            muscles={displayData.dominantMuscles}
                            color="green"
                            delay={0.3}
                        />
                        <DominantWeakCard
                            title="⚠️ À travailler"
                            muscles={displayData.weakMuscles}
                            color="red"
                            delay={0.4}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Category Section (Collapsible)
function CategorySection({ category, muscles, delay }: { category: MuscleCategory; muscles: any[]; delay: number }) {
    const [isOpen, setIsOpen] = useState(true);

    const categoryConfig: Record<MuscleCategory, { label: string; color: string; emoji: string }> = {
        CHEST: { label: 'Poitrine', color: '#ef4444', emoji: '🫀' },
        BACK: { label: 'Dos', color: '#3b82f6', emoji: '💪' },
        SHOULDERS: { label: 'Épaules', color: '#f59e0b', emoji: '🏋️' },
        ARMS: { label: 'Bras', color: '#10b981', emoji: '💪' },
        LEGS: { label: 'Jambes', color: '#a78bfa', emoji: '🦵' },
        CORE: { label: 'Core', color: '#ec4899', emoji: '🔥' },
        OTHER: { label: 'Autres', color: '#6b7280', emoji: '📋' },
    };

    const config = categoryConfig[category];
    const workedMuscles = muscles.filter(m => m.totalVolume > 0).length;
    const totalMuscles = muscles.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="space-y-3"
        >
            {/* Category Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#18181b] border border-white/5 rounded-xl hover:border-white/10 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${config.color}20` }}
                    >
                        <div style={{ color: config.color }} className="font-bold text-lg">
                            {config.emoji}
                        </div>
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white">{config.label}</h3>
                        <p className="text-sm text-gray-400">
                            {workedMuscles}/{totalMuscles} travaillés
                        </p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                )}
            </button>

            {/* Muscle Cards */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-3 overflow-hidden"
                    >
                        {muscles.map((stat, index) => (
                            <MuscleCard key={stat.muscleGroupId} stat={stat} delay={delay + index * 0.03} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Score Card Component
function ScoreCard({
    title,
    value,
    icon,
    color,
    delay,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    delay: number;
}) {
    const percentage = Math.min(100, value);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="relative group"
        >
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                style={{ backgroundColor: `${color}20` }}
            />

            <div className="relative bg-[#18181b] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                <div
                    className="inline-flex p-2.5 rounded-xl mb-4"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <div style={{ color }}>{icon}</div>
                </div>

                <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>

                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-white">{value}</span>
                    <span className="text-gray-500 text-lg font-medium">/100</span>
                </div>

                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

// Muscle Card Component
function MuscleCard({ stat, delay }: { stat: any; delay: number }) {
    const isWorked = stat.totalVolume > 0;

    const levelColors = ['#4b5563', '#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#9333ea', '#ec4899', '#f472b6', '#facc15'];

    // 🏷️ Labels dynamiques pour tous les niveaux
    const getLevelLabel = (level: number): string => {
        if (level === 0) return 'Novice';
        if (level === 1) return 'Débutant';
        if (level === 2) return 'Apprenti';
        if (level === 3) return 'Intermédiaire';
        if (level === 4) return 'Confirmé';
        if (level === 5) return 'Avancé';
        if (level === 6) return 'Expert';
        if (level === 7) return 'Maître';
        if (level === 8) return 'Élite';
        if (level === 9) return 'Champion';
        if (level >= 10 && level < 15) return 'Légende';
        if (level >= 15 && level < 20) return 'Titan';
        if (level >= 20) return 'Divin';
        return 'Inconnu';
    };

    const heatConfig = {
        HOT: { icon: <Flame className="w-3.5 h-3.5" />, color: '#ef4444', label: 'Chaud' },
        WARM: { icon: <Zap className="w-3.5 h-3.5" />, color: '#f97316', label: 'Tiède' },
        COLD: { icon: <Snowflake className="w-3.5 h-3.5" />, color: '#3b82f6', label: 'Froid' },
        FROZEN: { icon: <Snowflake className="w-3.5 h-3.5" />, color: '#06b6d4', label: 'Gelé' },
    };

    if (!isWorked) {
        // Muscle non travaillé
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                className="bg-[#18181b]/50 border border-dashed border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
            >
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-500 text-sm leading-tight pr-2">
                        {stat.muscleGroup?.name || 'Inconnu'}
                    </h3>
                    <div className="p-1 bg-gray-700/30 rounded">
                        <Lock className="w-3 h-3 text-gray-600" />
                    </div>
                </div>

                <div className="inline-block px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-600 font-medium">
                    Non travaillé
                </div>
            </motion.div>
        );
    }

    // Muscle travaillé
    const heat = stat.heat ? heatConfig[stat.heat as MuscleHeat] : null;

    // Couleur adaptative selon le niveau (cycle si > 9)
    const levelColor = levelColors[Math.min(stat.level, levelColors.length - 1)] || levelColors[levelColors.length - 1];

    // Barre de progression : montre le niveau actuel sur 10 (reset tous les 10 niveaux pour l'affichage visuel)
    const progress = ((stat.level % 10) / 10) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="group relative"
        >
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                style={{ backgroundColor: `${levelColor}15` }}
            />

            <div
                className="relative bg-[#18181b] border rounded-xl p-4 hover:border-white/10 transition-all"
                style={{ borderColor: `${levelColor}20` }}
            >
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white text-sm leading-tight pr-2">
                        {stat.muscleGroup?.name || 'Inconnu'}
                    </h3>
                    {heat && (
                        <div
                            className="p-1 rounded flex-shrink-0"
                            style={{ backgroundColor: `${heat.color}15`, color: heat.color }}
                        >
                            {heat.icon}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <div
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                            backgroundColor: `${levelColor}20`,
                            color: levelColor,
                        }}
                    >
                        {getLevelLabel(stat.level)}
                    </div>
                    <div className="flex items-center gap-0.5">
                        {[...Array(stat.level)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 h-2.5 rounded-full"
                                style={{ backgroundColor: levelColor }}
                            />
                        ))}
                    </div>
                </div>

                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: levelColor }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Volume</span>
                    <span className="text-xs font-bold text-gray-300">
                        {stat.totalVolume >= 1000
                            ? `${(stat.totalVolume / 1000).toFixed(1)}k`
                            : Math.round(stat.totalVolume)} kg
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// Dominant/Weak Card
function DominantWeakCard({
    title,
    muscles,
    color,
    delay,
}: {
    title: string;
    muscles: string[];
    color: 'green' | 'red';
    delay: number;
}) {
    const config = {
        green: {
            bg: 'from-green-500/10 to-[#18181b]',
            border: 'border-green-500/20',
            text: 'text-green-400',
            icon: Trophy,
        },
        red: {
            bg: 'from-red-500/10 to-[#18181b]',
            border: 'border-red-500/20',
            text: 'text-red-400',
            icon: Target,
        },
    };

    const { bg, border, text, icon: Icon } = config[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-5`}
        >
            <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${text}`} />
                <h3 className={`font-bold ${text} text-sm`}>{title}</h3>
            </div>

            {muscles.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Pas encore de données</p>
            ) : (
                <ul className="space-y-2">
                    {muscles.slice(0, 3).map((muscle, index) => (
                        <motion.li
                            key={muscle}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: delay + index * 0.1 }}
                            className="text-sm text-gray-300 flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                            {muscle}
                        </motion.li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}

// Skeleton Loading
function BodyAtlasSkeleton() {
    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="h-32 bg-[#18181b] border border-white/5 rounded-3xl animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-[#18181b] border border-white/5 rounded-2xl animate-pulse" />
                    <div className="h-40 bg-[#18181b] border border-white/5 rounded-2xl animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <div className="h-16 bg-[#18181b] border border-white/5 rounded-xl animate-pulse mb-3" />
                            <div className="grid grid-cols-2 gap-3">
                                {[...Array(4)].map((_, j) => (
                                    <div
                                        key={j}
                                        className="h-28 bg-[#18181b] border border-white/5 rounded-xl animate-pulse"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
