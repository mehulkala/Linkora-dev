import { Trash2, Copy, ExternalLink } from "lucide-react";
import { dashboardStore } from "../store/dashboardStore.js";
import { UrlTableSkeleton } from "./UrlTableSkeleton.jsx";

export default function UrlTable() {
    const {
        urls,
        search,
        sortBy,
        deleteUrl,
        copyUrl,
        isLoading
    } = dashboardStore();

    if (isLoading) {
        return <UrlTableSkeleton/>
    }

    // Filter
    const filteredUrls = urls.filter((url) => {
        const query = search.toLowerCase();

        return (
            url.short_code.toLowerCase().includes(query) ||
            url.original_url.toLowerCase().includes(query)
        );
    });

    // Sort
    const filteredAndSortedUrls = [...filteredUrls].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.created_at) - new Date(a.created_at);

            case "oldest":
                return new Date(a.created_at) - new Date(b.created_at);

            case "mostClicks":
                return b.click_count - a.click_count;

            case "leastClicks":
                return a.click_count - b.click_count;

            default:
                return 0;
        }
    });

    if (filteredAndSortedUrls.length === 0) {
        return (
            <div className="mt-8 card bg-base-100 shadow">
                <div className="card-body text-center">
                    <p className="text-base-content/70">
                        🔗 No URLs found

                    </p>
                        <p className="mt-1 text-base-content/70">Create your first shortened URL to get started.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 overflow-x-auto rounded-xl bg-base-100 shadow">
            <table className="table">
                <thead>
                    <tr>
                        <th>Short URL</th>
                        <th>Original URL</th>
                        <th>Clicks</th>
                        <th>Created</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredAndSortedUrls.map((url) => (
                        <tr key={url.id}>
                            <td>
                                <a
                                    href={url.shortUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="link link-primary flex items-center gap-2"
                                >
                                    {url.short_code}
                                    <ExternalLink size={16} />
                                </a>
                            </td>

                            <td title={url.original_url} className="max-w-xs truncate">
                                {url.original_url}
                            </td>

                            <td>{url.click_count}</td>

                            <td>
                                {new Date(url.created_at).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </td>

                            <td>
                                <div className="flex justify-center gap-2">
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => copyUrl(url.shortUrl)}
                                    >
                                        <Copy size={16} />
                                    </button>

                                    <button
                                        className="btn btn-sm btn-error btn-outline"
                                        onClick={() => deleteUrl(url.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}