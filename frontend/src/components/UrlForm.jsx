import { useState } from "react";

export function UrlForm({ onGenerate, loading }) {
    const [url, setUrl] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!url.trim()) return;

        const success = await onGenerate(url);

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