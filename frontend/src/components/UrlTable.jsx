import { Trash2, Copy, ExternalLink, QrCode } from "lucide-react";
import { dashboardStore } from "../store/dashboardStore.js";
import { UrlTableSkeleton } from "./UrlTableSkeleton.jsx";
import { useState } from "react";
import { QRCodeModal } from "./QRCodeModal.jsx";

const getExpirationInfo = (expiresAt) => {
    if (!expiresAt) {
        return {
            label: "Never",
            title: "This link never expires",
            expired: false,
        };
    }

    const expiration = new Date(expiresAt);
    const now = new Date();

    if (expiration <= now) {
        return {
            label: "Expired",
            title: `Expired on ${expiration.toLocaleString("en-IN")}`,
            expired: true,
        };
    }

    const diffMs = expiration - now;
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));

    const days = Math.floor(diffMinutes / (60 * 24));
    const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
    const minutes = diffMinutes % 60;

    let label;

    if (days > 0) {
        label = `Expires in ${days}d`;
    } else if (hours > 0) {
        label = `Expires in ${hours}h`;
    } else {
        label = `Expires in ${minutes}m`;
    }

    return {
        label,
        title: `Expires on ${expiration.toLocaleString("en-IN")}\n${days}d ${hours}h ${minutes}m remaining`,
        expired: false,
    };
};

export default function UrlTable() {
    const {
        urls,
        search,
        sortBy,
        deleteUrl,
        copyUrl,
        isLoading
    } = dashboardStore();

    const [qrUrl, setQrUrl] = useState(null);

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
                        <th>Expires</th>
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
                                {(() => {
                                    const info = getExpirationInfo(url.expires_at);

                                    return (
                                        <span
                                            className={`badge ${
                                                info.expired
                                                    ? "badge-error badge-outline"
                                                    : url.expires_at
                                                        ? "badge-warning badge-outline"
                                                        : "badge-success badge-outline"
                                            }`}
                                            title={info.title}
                                        >
                                            {info.label}
                                        </span>
                                    );
                                })()}
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
                                        className="btn btn-sm btn-outline"
                                        onClick={() => setQrUrl(url.shortUrl)}
                                    >
                                        <QrCode size={16} />
                                    </button>

                                    <button
                                        className="btn btn-sm btn-error btn-outline"
                                        onClick={() => deleteUrl(url.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    {qrUrl && (
                                        <QRCodeModal
                                            shortUrl={qrUrl}
                                            onClose={() => setQrUrl(null)}
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}