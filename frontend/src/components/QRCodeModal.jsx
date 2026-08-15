import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, X } from "lucide-react";

export function QRCodeModal({ shortUrl, onClose }) {
    const canvasRef = useRef(null);

    const handleDownload = () => {
        const canvas = canvasRef.current?.querySelector("canvas");

        if (!canvas) return;

        const link = document.createElement("a");
        link.download = "linkora-qr.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    if (!shortUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="card bg-base-100 w-full max-w-sm shadow-2xl">
                
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <h2 className="card-title">
                            QR Code
                        </h2>

                        <button
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="divider"></div>

                    <div
                        ref={canvasRef}
                        className="flex justify-center py-4"
                    >
                        <QRCodeCanvas
                            value={shortUrl}
                            size={220}
                            level="H"
                            includeMargin
                        />
                    </div>

                    <p className="text-center text-sm text-base-content/70 break-all">
                        {shortUrl}
                    </p>

                    <div className="card-actions justify-center mt-4">
                        <button
                            className="btn btn-primary"
                            onClick={handleDownload}
                        >
                            <Download size={18} />
                            Download QR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}