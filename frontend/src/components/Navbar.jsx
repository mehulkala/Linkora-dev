export function Navbar() {
    return (
        <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
            <div className="mx-auto w-full max-w-6xl px-4">

                <a className="flex items-center gap-3">
                    <div className="text-3xl">🔗</div>

                    <div>
                        <h1 className="text-2xl font-bold text-primary">
                            URL Shortener
                        </h1>

                        <p className="text-sm text-base-content/70">
                            Fast • Secure • Simple
                        </p>
                    </div>
                </a>

            </div>
        </div>
    );
}