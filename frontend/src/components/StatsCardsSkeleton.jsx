export function StatsCardsSkeleton() {
    return (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div
                    key={item}
                    className="card bg-base-100 shadow-xl border border-base-300"
                >
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="skeleton h-4 w-24"></div>
                                <div className="skeleton h-10 w-16"></div>
                                <div className="skeleton h-3 w-28"></div>
                            </div>

                            <div className="skeleton h-16 w-16 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}