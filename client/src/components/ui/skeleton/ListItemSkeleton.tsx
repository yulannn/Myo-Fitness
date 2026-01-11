interface ListItemSkeletonProps {
    count?: number;
}

export default function ListItemSkeleton({ count = 3 }: ListItemSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-[#18181b] rounded-xl p-4 border border-white/5 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-3/4" />
                            <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
