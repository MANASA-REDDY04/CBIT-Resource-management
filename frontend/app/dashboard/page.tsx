"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { DashboardStats, DashboardActivity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DashboardStatsSkeleton, ActivityFeedSkeleton } from "@/components/ui/LoadingSkeleton";
import { getStatusBadgeVariant, formatDate } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  Clock,
  Building2,
  Lightbulb,
  UserCheck,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Search,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const canCreate = user?.role === "ADMIN" || user?.can_create_records;

  // 1. Fetch Real Stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data;
    },
  });

  // 2. Fetch Recent Activities
  const { data: activity, isLoading: activityLoading } = useQuery<DashboardActivity>({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const res = await api.get("/dashboard/recent-activity");
      return res.data;
    },
  });

  const statCards = [
    {
      title: "Total Resource Persons",
      value: stats?.total_resource_persons ?? 0,
      icon: Users,
      color: "text-cbit-navy-800 bg-cbit-navy-50 border-cbit-navy-100",
      description: "Across all departments & topics",
    },
    {
      title: "Approved Persons",
      value: stats?.approved_resource_persons ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50 border-emerald-100",
      description: "Active in general directory",
    },
    {
      title: "Pending Approvals",
      value: stats?.pending_approvals ?? 0,
      icon: Clock,
      color: "text-amber-700 bg-amber-50 border-amber-100",
      description: "Awaiting administrative review",
      alert: (stats?.pending_approvals ?? 0) > 0,
    },
    {
      title: "Partner Organisations",
      value: stats?.total_organisations ?? 0,
      icon: Building2,
      color: "text-sky-700 bg-sky-50 border-sky-100",
      description: "Corporate, Research & Academic",
    },
    {
      title: "Expertise Areas",
      value: stats?.total_expertise_areas ?? 0,
      icon: Lightbulb,
      color: "text-indigo-700 bg-indigo-50 border-indigo-100",
      description: "Mapped subject domains",
    },
    {
      title: "Registered Staff",
      value: stats?.total_registered_staff ?? 0,
      icon: UserCheck,
      color: "text-purple-700 bg-purple-50 border-purple-100",
      description: "College faculty & coordinators",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-cbit-navy-900 to-cbit-navy-800 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cbit-teal-500/20 text-cbit-teal-300 border border-cbit-teal-400/30">
              Institutional Portal
            </span>
            <span className="text-xs text-cbit-navy-300">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-sm text-cbit-navy-200 mt-1 max-w-2xl">
            Central repository for searching and maintaining external industry resource persons, guest faculty, and domain experts for CBIT Hyderabad.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/resource-persons">
            <Button variant="secondary" size="md">
              <Search className="w-4 h-4 mr-1.5" />
              Search Directory
            </Button>
          </Link>

          {canCreate && (
            <Link href="/resource-persons/new">
              <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add Resource Person
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin/approvals">
              <Button variant="outline" size="md" className="bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Pending Queue ({stats?.pending_approvals ?? 0})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      {statsLoading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-lg border ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  {card.alert && (
                    <span className="inline-flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Action Needed
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">{card.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Two-Column Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Approved Resource Persons */}
        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Recently Approved Experts
              </CardTitle>
              <CardDescription className="text-xs">
                Resource persons ready for institutional engagements
              </CardDescription>
            </div>
            <Link
              href="/resource-persons"
              className="text-xs font-medium text-cbit-teal-600 hover:text-cbit-teal-700 flex items-center"
            >
              View Directory <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 pt-3">
            {activityLoading ? (
              <ActivityFeedSkeleton count={4} />
            ) : activity?.recently_approved && activity.recently_approved.length > 0 ? (
              activity.recently_approved.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/resource-persons/${item.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-cbit-navy-800 transition-colors"
                    >
                      {item.full_name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.designation}{" "}
                      {item.organisation_names && item.organisation_names.length > 0 && (
                        <span>• {item.organisation_names[0]}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">Approved</Badge>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatDate(item.reviewed_at || item.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center">
                No approved resource persons yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Approval Summary / Recent Submissions */}
        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                {isAdmin ? "Pending Approval Queue" : "Recent Submissions"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAdmin
                  ? "Submissions awaiting verification and approval"
                  : "Latest additions to the portal"}
              </CardDescription>
            </div>
            {isAdmin && (
              <Link
                href="/admin/approvals"
                className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center"
              >
                Review All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 pt-3">
            {activityLoading ? (
              <ActivityFeedSkeleton count={4} />
            ) : (isAdmin ? activity?.pending_summary : activity?.recently_added) &&
              (isAdmin ? activity?.pending_summary : activity?.recently_added)!.length > 0 ? (
              (isAdmin ? activity?.pending_summary : activity?.recently_added)!.map((item) => {
                const statusBadge = getStatusBadgeVariant(item.approval_status);
                return (
                  <div key={item.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/resource-persons/${item.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-cbit-navy-800 transition-colors"
                      >
                        {item.full_name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.designation}{" "}
                        {item.organisation_names && item.organisation_names.length > 0 && (
                          <span>• {item.organisation_names[0]}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {statusBadge.label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center">
                {isAdmin ? "No pending approvals in queue." : "No recent submissions."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

