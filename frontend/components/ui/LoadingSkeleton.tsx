import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
};

// ------------------------------------------------------------------------------
// 1. Dashboard KPI Stats Skeleton (6 Cards Grid)
// ------------------------------------------------------------------------------
export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-44" />
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------------------
// 2. Dashboard Activity Feeds Skeleton (Recent Approved / Submissions)
// ------------------------------------------------------------------------------
export const ActivityFeedSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-3.5 flex items-center justify-between">
          <div className="space-y-2 flex-1 max-w-sm">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="space-y-1.5 flex flex-col items-end">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------------------
// 3. Resource Person Directory Card Skeleton
// ------------------------------------------------------------------------------
export const ResourcePersonCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div>
            {/* Name & Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>

            {/* Organisation pill */}
            <div className="mt-3.5">
              <Skeleton className="h-7 w-full rounded-lg" />
            </div>

            {/* Contact Details */}
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>

            {/* Expertise Pills */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Skeleton className="h-2.5 w-20 mb-2" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------------------
// 4. Resource Person Profile Detail Page Skeleton
// ------------------------------------------------------------------------------
export const ProfileDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top action breadcrumb */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-5">
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bio card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Org history card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <Skeleton className="h-5 w-52" />
            <div className="space-y-4 pt-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Expertise card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>

          {/* Record info card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// 5. Organisation Directory Grid Skeleton
// ------------------------------------------------------------------------------
export const OrganisationCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2.5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-48 mt-2" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------------------
// 6. Expertise Grid Skeleton
// ------------------------------------------------------------------------------
export const ExpertiseGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2.5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------------------
// 7. General Data Table Skeleton (For Admin & Submissions Lists)
// ------------------------------------------------------------------------------
export const DataTableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
