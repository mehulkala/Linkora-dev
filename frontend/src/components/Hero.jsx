import { Link2, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export function Hero() {
    return (
        <section className="text-center py-4">
            <div className="flex justify-center mb-3">
                <div className="bg-primary text-primary-content p-3 rounded-full shadow-md">
                    <Link2 size={36} />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
                URL Shortener
            </h1>

            <p className="mt-2 text-base md:text-lg text-base-content/70">
                Shorten long URLs into clean, shareable links in seconds.
            </p>

            <div className="flex justify-center gap-6 mt-4 flex-wrap">

                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-warning" />
                    <span className="font-medium">Fast</span>
                </div>

                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-success" />
                    <span className="font-medium">Secure</span>
                </div>

                <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-primary" />
                    <span className="font-medium">Analytics</span>
                </div>

            </div>
        </section>
    );
}