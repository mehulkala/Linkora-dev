import { useState } from "react";
import {Navbar} from "../components/Navbar";
import {UrlForm} from "../components/UrlForm";
import {UrlResult} from "../components/UrlResult";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { Hero } from "../components/Hero.jsx";

export function HomePage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleGenerate = async (url) => {
        try {
            setLoading(true);
            setResult(null);

            const { data } = await axiosInstance.post("/generate-code", {
                url,
            });

            setResult({
                message: data.message,
                ...data.data,
            });

            return true;

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Something went wrong"
            );

            return false;

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-base-200">
              <div className="max-w-4xl mx-auto px-6 py-12">
                  <Hero/>
                  <div className="card bg-base-100 shadow-xl border border-base-300">
                      <div className="card-body">
                          <UrlForm onGenerate={handleGenerate} loading={loading} />
                      </div>
                  </div>
                  <UrlResult result={result} />
              </div>
            </div>
        </>
    );
}