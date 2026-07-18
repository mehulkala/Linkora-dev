import {
  Link2,
  MousePointerClick,
  Activity,
  BarChart3,
} from "lucide-react";

import { StatCard } from "./StatCard";
import { dashboardStore } from "../store/dashboardStore.js";
import { StatsCardsSkeleton } from "./StatsCardsSkeleton.jsx";

export function StatsCards() {
  const {stats, isLoading} = dashboardStore();
  
  if (isLoading) {
      return <StatsCardsSkeleton />;
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total URLs"
        value={stats.totalUrls}
        subtitle="Links created"
        icon={Link2}
      />

      <StatCard
        title="Total Clicks"
        value={stats.totalClicks}
        subtitle="Across all links"
        icon={MousePointerClick}
      />

      <StatCard
        title="Average Clicks"
        value={stats.averageClicks}
        subtitle="Per shortened URL"
        icon={BarChart3}
      />

      <StatCard
        title="Active URLs"
        value={stats.activeUrls}
        subtitle="Currently available"
        icon={Activity}
      />

    </div>
  );
}