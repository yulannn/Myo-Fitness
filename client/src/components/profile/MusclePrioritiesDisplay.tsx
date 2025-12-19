import { useMuscleGroups } from '../../api/hooks/muscle-group/useGetMuscleGroups';

interface MusclePrioritiesDisplayProps {
    priorities: number[];
}

export default function MusclePrioritiesDisplay({ priorities }: MusclePrioritiesDisplayProps) {
    const { data: muscleGroups = [] } = useMuscleGroups();

    if (priorities.length === 0) return null;

    const selectedMuscles = muscleGroups.filter(m => priorities.includes(m.id));

    return (
        <div className="bg-[#18181b] p-5 rounded-2xl border border-white/5 mt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Priorités musculaires</h3>
            <div className="flex flex-wrap gap-2">
                {selectedMuscles.map((muscle) => (
                    <span key={muscle.id} className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#94fbdd]/10 text-[#94fbdd] border border-[#94fbdd]/20">
                        {muscle.name}
                    </span>
                ))}
            </div>
        </div>
    );
}
