export function ExpiredLinkPage() {
    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-6">
            <div className="card bg-base-100 shadow-xl border border-base-300 max-w-md w-full">
                <div className="card-body text-center items-center">

                    <div className="text-5xl mb-2">
                        ⏳
                    </div>

                    <h1 className="card-title text-2xl">
                        Link Expired
                    </h1>

                    <p className="text-base-content/70">
                        This short link is no longer available.
                    </p>

                    <a
                        href="/"
                        className="btn btn-primary mt-4"
                    >
                        Go to Linkora
                    </a>

                </div>
            </div>
        </div>
    );
}