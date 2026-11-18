"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ResourcePerson } from "@/types";
import { Button } from "@/components/ui/Button";
import { DataTableSkeleton } from "@/components/ui/LoadingSkeleton";
import { getStatusBadgeVariant, formatDate } from "@/lib/utils";
import { UserPlus, Clock, ExternalLink, AlertCircle, FileCheck2 } from "lucide-react";

export default function MySubmissionsPage() {
  const { data: submissions, isLoading, isError } = useQuery<ResourcePerson[]>({
    queryKey: ["my-submissions"],
    queryFn: async () => {
      const res = await api.get("/resource-persons/my/submissions");
      return res.data;
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <FileCheck2 className="w-6 h-6 mr-2 text-cbit-navy-800" />
            My Resource Person Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track status of profiles submitted by you (Pending review, Approved, or Rejected).
          </p>
        </div>

        <Link href="/resource-persons/new">
          <Button size="md">
            <UserPlus className="w-4 h-4 mr-1.5" />
            New Submission
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <DataTableSkeleton rows={5} cols={5} />
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-800 text-sm">
          Failed to load your submissions.
        </div>
      ) : submissions && submissions.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Full Name & Designation</th>
                  <th className="py-3 px-4">Primary Organisation</th>
                  <th className="py-3 px-4">Submitted On</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {submissions.map((item) => {
                  const badge = getStatusBadgeVariant(item.approval_status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/resource-persons/${item.id}`}
                          className="font-semibold text-slate-900 hover:text-cbit-navy-800"
                        >
                          {item.full_name}
                        </Link>
                        <p className="text-slate-500 text-[11px]">{item.designation}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.organisations && item.organisations.length > 0
                          ? item.organisations[0].organisation_name
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/resource-persons/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No submissions recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven’t submitted any external resource person profiles yet.
          </p>
          <Link href="/resource-persons/new">
            <Button size="sm" className="mt-4">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Submit First Profile
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

