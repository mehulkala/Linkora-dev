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

    isRefreshing: false,

    lastUpdated: null,

    fetchDashboard: async (initialLoad=false) => {  
        if(initialLoad){
            set({isLoading: true});
        }else{
            set({isRefreshing: true});
        }

        try {

            // Backend endpoint
            // GET /dashboard

            const res = await axiosInstance.get("/dashboard");

            set({
                stats: res.data.data.stats,
                urls: res.data.data.urls,
                lastUpdated: new Date(),
            });

        } catch (error) {

            toast.error(
                error.response?.data?.message ??
                "Failed to load dashboard"
            );

        } finally {
            if(initialLoad){
                set({isLoading: false});
            }else{
                set({isRefreshing: false});
            }
        }
    },



    deleteUrl: async (id) => {

        try {

            await axiosInstance.delete(`/urls/${id}`);

            set({
                urls: get().urls.filter(url => url.id !== id),
            });
            
            await get().fetchDashboard();

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