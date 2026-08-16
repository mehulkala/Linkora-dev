import { useState } from "react";

export function UrlForm({ onGenerate, loading }) {
    const [url, setUrl] = useState("");
    const [expiration, setExpiration] = useState("1d");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!url.trim()) return;

        const success = await onGenerate(url, expiration);

        if (success) {
            setUrl("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div>
                <label className="label">
                    <span className="label-text text-base font-semibold">
                        Enter your long URL
                    </span>
                </label>

                <div className="flex flex-col md:flex-row gap-3">

                    <input
                        type="url"
                        placeholder="https://example.com/very/long/url"
                        className="input input-bordered input-lg h-14 flex-1"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={loading}
                        required
                    />

                    <select
                        className="select select-bordered select-lg h-14"
                        value={expiration}
                        onChange={(e) => setExpiration(e.target.value)}
                        disabled={loading}
                    >
                        <option value="1h">1 Hour</option>
                        <option value="1d">1 Day</option>
                        <option value="7d">7 Days</option>
                        <option value="30d">30 Days</option>
                        <option value="never">Never</option>
                    </select>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg min-w-44"
                        disabled={loading}
                    >
                        {loading && (
                            <span className="loading loading-spinner loading-sm"></span>
                        )}

                        {loading
                            ? "Generating..."
                            : "Generate URL"}
                    </button>

                </div>
            </div>

        </form>
    );
}