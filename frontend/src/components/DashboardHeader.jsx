import { Link } from "react-router";
import { Plus, LayoutDashboard } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          {/* Left */}
          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-primary/10 p-4">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                My URLs
              </h1>

              <p className="mt-2 text-base-content/70 max-w-xl">
                View, manage, and analyze all your shortened links from one place.
              </p>
            </div>

          </div>

          {/* Right */}
          <Link
            to="/"
            className="btn btn-primary gap-2 relative z-50"
          >
            <Plus size={18} />
            New URL
          </Link>

        </div>

      </div>
    </div>
  );
}