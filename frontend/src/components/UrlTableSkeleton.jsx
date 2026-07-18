export function UrlTableSkeleton() {
    return (
        <div className="mt-8 overflow-x-auto rounded-xl bg-base-100 shadow border border-base-300">
            <table className="table">
                <thead>
                    <tr>
                        <th>Short URL</th>
                        <th>Original URL</th>
                        <th>Clicks</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <tr key={item}>
                            <td>
                                <div className="skeleton h-5 w-24"></div>
                            </td>

                            <td>
                                <div className="skeleton h-5 w-80"></div>
                            </td>

                            <td>
                                <div className="skeleton h-5 w-10"></div>
                            </td>

                            <td>
                                <div className="skeleton h-5 w-24"></div>
                            </td>

                            <td>
                                <div className="flex gap-2">
                                    <div className="skeleton h-9 w-9 rounded-lg"></div>
                                    <div className="skeleton h-9 w-9 rounded-lg"></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}