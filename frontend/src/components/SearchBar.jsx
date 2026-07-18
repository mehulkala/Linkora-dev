import { Search } from "lucide-react";
import { dashboardStore } from "../store/dashboardStore.js";

export function SearchBar() {
    const { search, setSearch } = dashboardStore();

    return (
        <div className="relative w-full  max-w-lg ">
            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
            />

            <input
                type="text"
                placeholder="Search by short URL or original URL..."
                className="input input-bordered w-full pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    );
}