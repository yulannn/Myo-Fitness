import { useBodyAtlas } from '../../api/hooks/body-atlas/useBodyAtlas';
import { useBodyAtlasStore } from '../../store/useBodyAtlasStore';
import { MuscleHeat } from '../../types/body-atlas.type';
import { Flame, Snowflake, Zap, TrendingUp, Trophy, Target, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const hasData = displayData.muscleStats.length > 0;

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Hero Header with gradient */}
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
                                    Ta cartographie musculaire
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Scores Grid */}
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

                {/* Muscle Groups Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                Groupes Musculaires
                            </h2>
                        </div>
                        {hasData && (
                            <span className="text-sm text-gray-400">
                                {displayData.muscleStats.length} muscles
                            </span>
                        )}
                    </div>

                    {!hasData ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {displayData.muscleStats.map((stat, index) => (
                                <MuscleCard key={stat.id} stat={stat} delay={index * 0.05} />
                            ))}
                        </div>
                    )}
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
            {/* Glow effect on hover */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                style={{ backgroundColor: `${color}20` }}
            />

            <div className="relative bg-[#18181b] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                {/* Icon */}
                <div
                    className="inline-flex p-2.5 rounded-xl mb-4"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <div style={{ color }}>{icon}</div>
                </div>

                {/* Title */}
                <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>

                {/* Value */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-white">{value}</span>
                    <span className="text-gray-500 text-lg font-medium">/100</span>
                </div>

                {/* Progress bar */}
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
    const levelColors = ['#4b5563', '#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444'];
    const levelLabels = ['Novice', 'Trained', 'Advanced', 'Expert', 'Master', 'Legend'];

    const heatConfig = {
        HOT: { icon: <Flame className="w-4 h-4" />, color: '#ef4444', label: 'Chaud' },
        WARM: { icon: <Zap className="w-4 h-4" />, color: '#f97316', label: 'Tiède' },
        COLD: { icon: <Snowflake className="w-4 h-4" />, color: '#3b82f6', label: 'Froid' },
        FROZEN: { icon: <Snowflake className="w-4 h-4" />, color: '#06b6d4', label: 'Gelé' },
    };

    const heat = heatConfig[stat.heat as MuscleHeat];
    const levelColor = levelColors[stat.level];
    const progress = (stat.level / 5) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="group relative"
        >
            {/* Hover glow */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                style={{ backgroundColor: `${levelColor}20` }}
            />

            <div
                className="relative bg-[#18181b] border rounded-2xl p-5 hover:border-white/10 transition-all"
                style={{ borderColor: `${levelColor}20` }}
            >
                {/* Header: Name + Heat */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-white text-lg leading-tight pr-2">
                        {stat.muscleGroup.name}
                    </h3>
                    <div
                        className="p-1.5 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${heat.color}15`, color: heat.color }}
                    >
                        {heat.icon}
                    </div>
                </div>

                {/* Level Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <div
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{
                            backgroundColor: `${levelColor}20`,
                            color: levelColor,
                        }}
                    >
                        {levelLabels[stat.level]}
                    </div>
                    <div className="flex items-center gap-1">
                        {[...Array(stat.level)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 h-3 rounded-full"
                                style={{ backgroundColor: levelColor }}
                            />
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: levelColor }}
                    />
                </div>

                {/* Volume */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Volume total</span>
                    <span className="text-sm font-bold text-gray-300">
                        {Math.round(stat.totalVolume).toLocaleString()} kg
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
                    {muscles.map((muscle, index) => (
                        <motion.li
                            key={muscle}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: delay + index * 0.1 }}
                            className="flex items-center gap-2 text-sm text-gray-300"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                            {muscle}
                        </motion.li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}

// Empty State
function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#94fbdd]/5 to-[#18181b] border border-white/5 rounded-2xl p-12 text-center"
        >
            <div className="w-20 h-20 mx-auto mb-6 bg-[#94fbdd]/10 rounded-2xl flex items-center justify-center">
                <Activity className="w-10 h-10 text-[#94fbdd]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Commence ton aventure</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                Complète ta première séance pour voir tes stats musculaires s'afficher ici !
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-[#94fbdd]/10 border border-[#94fbdd]/20 rounded-xl text-[#94fbdd] text-sm font-medium">
                <Zap className="w-4 h-4" />
                Commence une séance
            </div>
        </motion.div>
    );
}

// Skeleton Loading
function BodyAtlasSkeleton() {
    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Header skeleton */}
                <div className="h-32 bg-[#18181b] border border-white/5 rounded-3xl animate-pulse" />

                {/* Scores skeleton */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-[#18181b] border border-white/5 rounded-2xl animate-pulse" />
                    <div className="h-40 bg-[#18181b] border border-white/5 rounded-2xl animate-pulse" />
                </div>

                {/* Muscles skeleton */}
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-[#18181b] border border-white/5 rounded-lg animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-36 bg-[#18181b] border border-white/5 rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
