import {Navbar} from "../components/Navbar.jsx";
import {DashboardHeader} from "../components/DashboardHeader.jsx";
import {StatsCards} from "../components/StatsCards.jsx";
import SearchBar from "../components/SearchBar.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import UrlTable from "../components/UrlTable.jsx";
import { dashboardStore } from "../store/dashboardStore.js";
import { useEffect } from "react";

export function DashboardPage(){
    const {fetchDashboard} = dashboardStore();

    useEffect(()=>{
        fetchDashboard();
        const interval = setInterval(() => {
            fetchDashboard();
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchDashboard])
    
    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-base-200">
            <div className="mx-auto max-w-7xl px-6 py-10">
            <DashboardHeader />
            <div className="alert alert-info mt-4">
                <span className="text-sm">
                    Analytics may take up to <strong>1 minute</strong> to reflect recent clicks due to periodic data synchronization.
                </span>
            </div>
            <StatsCards />

            <div className="controls">
                <SearchBar />
                <SortDropdown />
            </div>

            <UrlTable />
            </div>
            </div>
        </>
    )
}