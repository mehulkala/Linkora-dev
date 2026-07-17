import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const authStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningup: false,
    isLoggingIn: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/me");
            set({authUser: res.data.user});
        }catch(error){
            console.log("Error in authCheck: ", error);
            set({authUser: null});
        } finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async(data)=>{
        set({isSigningup: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            await get().checkAuth();
            toast.success("Signup successful!")
        } catch (error) {
            toast.error(error.response.data.message || "Signup failed. Please try again.")
        } finally{
            set({isSigningup: false})
        }
    },

    login: async(data)=>{
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post("/auth/login", data)

            await get().checkAuth();

            toast.success("Logged in successfully")
        } catch (error) {
            toast.error(error.response.data.message)
        } finally{
            set({isLoggingIn: false})
        }
    },

    logout: async()=>{
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser: null})
            toast.success("Logged out successfully")
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },
}) )
