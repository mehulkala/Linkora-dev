import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const urlStore = create((set, get) => ({
    result: null,
    isGenerating: false,
    generateShortUrl: async (url, expiration) => {
        try {

            set({isGenerating:true});
            set({result: null});
            
            const { data } = await axiosInstance.post("/generate-code", {
                url,
                expiration
            });

            set({result:{
                message: data.message,
                ...data.data,
            }});

            return true;

        } catch (error) {
            toast.error(
                error.response?.data?.message ??
                "Something went wrong"
            );

            return false;

        } finally {
            set({isGenerating:false});
        }
    }
}))