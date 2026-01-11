export default function SessionCardSkeleton() {
    return (
        <div className="bg-[#18181b] rounded-lg border border-white/5 p-4 animate-pulse">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-white/10 rounded-lg w-40" />
                    <div className="flex items-center gap-3">
                        <div className="h-3 bg-white/5 rounded w-20" />
                        <div className="h-3 bg-white/5 rounded w-24" />
                    </div>
                </div>
                <div className="w-8 h-8 bg-white/5 rounded-md" />
            </div>
        </div>
    );
}
