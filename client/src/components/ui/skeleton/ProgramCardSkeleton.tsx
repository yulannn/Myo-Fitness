export default function ProgramCardSkeleton() {
    return (
        <div className="rounded-3xl bg-gradient-to-br from-[#18181b] to-[#121214] border border-white/5 p-6 animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-6 bg-white/10 rounded-lg w-48 mb-2" />
                    <div className="flex items-center gap-3">
                        <div className="h-4 bg-white/5 rounded-full w-24" />
                        <div className="h-4 bg-white/5 rounded-full w-32" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 bg-white/5 rounded-full" />
                    <div className="w-10 h-10 bg-white/5 rounded-full" />
                </div>
            </div>

            {/* Sessions */}
            <div className="space-y-2">
                <div className="h-12 bg-black/20 rounded-xl" />
                <div className="h-12 bg-black/20 rounded-xl" />
                <div className="h-12 bg-black/20 rounded-xl" />
            </div>
        </div>
    );
}
