import React from "react";

export function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow duration-300">
      <div className="card-body p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-base-content/60">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-base-content">
              {value}
            </h2>

            {subtitle && (
              <p className="mt-2 text-xs text-base-content/50">
                {subtitle}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-primary/10 p-3">
            <Icon className="w-6 h-6 text-primary" />
          </div>

        </div>

      </div>
    </div>
  );
}