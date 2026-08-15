import toast from "react-hot-toast";
import { useState } from "react";
import { QRCodeModal } from "./QRCodeModal.jsx";

export function UrlResult({ result }) {
    const [showQR, setShowQR] = useState(false);
    if (!result) return null;
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result.shortUrl);
            toast.success("Short URL copied to clipboard!");
        } catch {
            toast.error("Failed to copy URL.");
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl mt-8 border border-base-300">
            <div className="card-body">

                <h2 className="card-title text-primary">
                    {result.message}
                </h2>

                <div className="divider"></div>

                <div className="space-y-5">

                    <div>
                        <p className="font-semibold mb-2">
                            Original URL
                        </p>

                        <div className="bg-base-200 rounded-lg p-3 break-all">
                            {result.originalUrl}
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold mb-2">
                            Short URL
                        </p>

                        <div className="bg-base-200 rounded-lg p-3 break-all">
                            <a
                                href={result.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                            >
                                {result.shortUrl}
                            </a>
                        </div>
                    </div>

                </div>

                <div className="card-actions justify-end mt-6">

                    <button
                        className="btn btn-outline"
                        onClick={handleCopy}
                    >
                        📋 Copy
                    </button>

                    <button
                        className="btn btn-outline"
                        onClick={() => setShowQR(true)}
                    >
                        📱 QR
                    </button>

                    <a
                        href={result.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        🔗 Open
                    </a>

                    {showQR && (
                        <QRCodeModal
                            shortUrl={result.shortUrl}
                            onClose={() => setShowQR(false)}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}