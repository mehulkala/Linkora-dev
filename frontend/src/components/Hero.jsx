import { Link2, ShieldCheck, Zap } from "lucide-react";

export function Hero() {
    return (
        <section className="hero py-8">
            <div className="hero-content text-center">
                <div className="max-w-3xl">

                    <div className="flex justify-center mb-6">
                        <div className="bg-primary text-primary-content p-5 rounded-full shadow-lg">
                            <Link2 size={48} />
                        </div>
                    </div>

                    <h1 className="text-5xl font-extrabold text-primary">
                        URL Shortener
                    </h1>

                    <p className="mt-5 text-lg text-base-content/70 leading-relaxed">
                        Shorten long URLs into clean, shareable links in seconds.
                        Fast, secure, and built for reliability.
                    </p>

                    <div className="flex justify-center gap-6 mt-8 flex-wrap">

                        <div className="flex items-center gap-2">
                            <Zap
                                size={20}
                                className="text-warning"
                            />
                            <span className="font-medium">
                                Fast
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                size={20}
                                className="text-success"
                            />
                            <span className="font-medium">
                                Secure
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link2
                                size={20}
                                className="text-primary"
                            />
                            <span className="font-medium">
                                Shareable
                            </span>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}