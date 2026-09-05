import { Link2 } from "lucide-react";
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
        <form onSubmit={handleSubmit}>
            <div>
                <label className="label px-0 mb-1">
                    <span className="label-text text-base font-semibold">
                        Destination URL
                    </span>
                </label>

                <div className="flex flex-col md:flex-row gap-3">

                    {/* URL Input */}
                    <div className="relative flex-1">
                        <Link2
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                        />

                        <input
                            type="url"
                            placeholder="https://example.com/very/long/url"
                            className="
                                input
                                input-bordered
                                w-full
                                h-14
                                pl-11
                                pr-4
                                text-base
                                rounded-lg
                                focus:border-primary
                                focus:outline-none
                                focus:ring-2
                                focus:ring-primary/20
                            "
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Expiration */}
                    <select
                        className="
                            select
                            select-bordered
                            h-14
                            w-full
                            md:w-36
                            text-sm
                            rounded-lg
                            focus:border-primary
                            focus:outline-none
                            focus:ring-2
                            focus:ring-primary/20
                        "
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

                    {/* Generate */}
                    <button
                        type="submit"
                        className="
                            btn
                            btn-primary
                            h-14
                            w-full
                            md:w-48
                            rounded-lg
                        "
                        disabled={loading}
                    >
                        {loading && (
                            <span className="loading loading-spinner loading-sm"></span>
                        )}

                        {loading ? "Generating..." : "Generate Short URL"}
                    </button>

                </div>
            </div>
        </form>
    );
}