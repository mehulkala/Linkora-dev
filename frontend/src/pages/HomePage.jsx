import { Navbar } from "../components/Navbar.jsx";
import { UrlForm } from "../components/UrlForm.jsx";
import { UrlResult } from "../components/UrlResult.jsx";
import { Hero } from "../components/Hero.jsx";
import { urlStore } from "../store/urlStore.js";

export function HomePage() {
    const {
        result,
        isGenerating,
        generateShortUrl,
    } = urlStore();

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-base-200">
                <div className="max-w-5xl mx-auto px-6 py-6 md:py-8">

                    <Hero />

                    <div className="mt-5">
                        <div className="card bg-base-100 border border-base-300 shadow-lg">
                            <div className="card-body p-6">
                                <UrlForm
                                    onGenerate={generateShortUrl}
                                    loading={isGenerating}
                                />
                            </div>
                        </div>

                        <UrlResult result={result} />
                    </div>

                </div>
            </main>
        </>
    );
}