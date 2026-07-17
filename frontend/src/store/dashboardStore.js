import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const dashboardStore = create((set, get) => ({

    stats: {
        totalUrls: 0,
        totalClicks: 0,
        averageClicks: 0,
        activeUrls: 0,
    },

    urls: [],

    search: "",

    sortBy: "newest",

    isLoading: false,

    fetchDashboard: async () => {
        set({ isLoading: true });

        try {

            // Backend endpoint
            // GET /dashboard

            const res = await axiosInstance.get("/dashboard");

            set({
                stats: res.data.data.stats,
                urls: res.data.data.urls,
            });

        } catch (error) {

            toast.error(
                error.response?.data?.message ??
                "Failed to load dashboard"
            );

        } finally {
            set({ isLoading: false });
        }
    },



    deleteUrl: async (id) => {

        try {

            await axiosInstance.delete(`/urls/${id}`);

            set({
                urls: get().urls.filter(url => url.id !== id),
            });

            toast.success("URL deleted");

        } catch (error) {

            toast.error(
                error.response?.data?.message ??
                "Unable to delete URL"
            );

        }
    },



    copyUrl: (shortUrl) => {

        navigator.clipboard.writeText(shortUrl);

        toast.success("Copied to clipboard");

    },



    setSearch: (value) => {

        set({
            search: value,
        });

    },



    setSortBy: (value) => {

        set({
            sortBy: value,
        });

    },



    clearDashboard: () => {

        set({

            stats: {
                totalUrls: 0,
                totalClicks: 0,
                averageClicks: 0,
                activeUrls: 0,
            },

            urls: [],

            search: "",

            sortBy: "newest",

        });

    },

}));