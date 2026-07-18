import { ArrowUpDown } from "lucide-react";
import { dashboardStore } from "../store/dashboardStore.js";

export default function SortDropdown() {
    const { sortBy, setSortBy } = dashboardStore();

    return (
        <div className="flex items-center gap-2">
            <ArrowUpDown size={18} className="text-base-content/70" />

            <select
                className="select select-bordered"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostClicks">Most Clicked</option>
                <option value="leastClicks">Least Clicked</option>
            </select>
        </div>
    );
}