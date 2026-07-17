import { useState } from "react";
import {Navbar} from "../components/Navbar.jsx";
import {UrlForm} from "../components/UrlForm.jsx";
import {UrlResult} from "../components/UrlResult.jsx";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
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
            <div className="min-h-screen bg-base-200">
              <div className="max-w-4xl mx-auto px-6 py-12">
                  <Hero/>
                  <div className="card bg-base-100 shadow-xl border border-base-300">
                      <div className="card-body">
                          <UrlForm onGenerate={generateShortUrl} loading={isGenerating} />
                      </div>
                  </div>
                  <UrlResult result={result} />
              </div>
            </div>
        </>
    );
}