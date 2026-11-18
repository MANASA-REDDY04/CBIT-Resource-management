"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ResourcePerson } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DataTableSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  Building2,
  Award,
  User,
  Check,
  X,
} from "lucide-react";

export default function AdminApprovalsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState<ResourcePerson | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionComments, setRejectionComments] = useState("");

  // Approval Modal State
  const [approvingItem, setApprovingItem] = useState<ResourcePerson | null>(null);
  const [approvalComments, setApprovalComments] = useState("Approved for directory inclusion.");

  // Fetch pending
  const { data: pendingData, isLoading: pendingLoading } = useQuery<{
    items: ResourcePerson[];
    total: number;
  }>({
    queryKey: ["admin-approvals-pending"],
    queryFn: async () => {
      const res = await api.get("/admin/approvals/pending");
      return res.data;
    },
  });

  // Fetch approved
  const { data: approvedData, isLoading: approvedLoading } = useQuery<{
    items: ResourcePerson[];
    total: number;
  }>({
    queryKey: ["admin-approvals-approved"],
    queryFn: async () => {
      const res = await api.get("/admin/approvals/approved");
      return res.data;
    },
    enabled: activeTab === "approved",
  });

  // Fetch rejected
  const { data: rejectedData, isLoading: rejectedLoading } = useQuery<{
    items: ResourcePerson[];
    total: number;
  }>({
    queryKey: ["admin-approvals-rejected"],
    queryFn: async () => {
      const res = await api.get("/admin/approvals/rejected");
      return res.data;
    },
    enabled: activeTab === "rejected",
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments?: string }) => {
      const res = await api.post(`/admin/approvals/${id}/approve`, {
        action: "APPROVE",
        comments,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-approvals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-approvals-approved"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
      setApprovingItem(null);
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({
      id,
      rejection_reason,
      comments,
    }: {
      id: string;
      rejection_reason: string;
      comments?: string;
    }) => {
      const res = await api.post(`/admin/approvals/${id}/reject`, {
        action: "REJECT",
        rejection_reason,
        comments,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-approvals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-approvals-rejected"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
      setRejectingItem(null);
      setRejectionReason("");
      setRejectionComments("");
    },
  });

  const currentList =
    activeTab === "pending"
      ? pendingData?.items
      : activeTab === "approved"
      ? approvedData?.items
      : rejectedData?.items;

  const currentLoading =
    activeTab === "pending"
      ? pendingLoading
      : activeTab === "approved"
      ? approvedLoading
      : rejectedLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-cbit-navy-800" />
            Profile Approval Workflow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review submissions made by Authorised Faculty before they become publicly searchable in the college directory.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Submissions</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">
            {pendingData?.total ?? 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === "approved"
              ? "border-emerald-500 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approved Profiles</span>
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === "rejected"
              ? "border-rose-500 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Rejected Profiles</span>
        </button>
      </div>

      {/* Submissions Table / List */}
      {currentLoading ? (
        <DataTableSkeleton rows={6} cols={5} />
      ) : currentList && currentList.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Candidate & Designation</th>
                  <th className="py-3 px-4">Organisations & Expertise</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4">
                      <Link
                        href={`/resource-persons/${item.id}`}
                        className="font-bold text-slate-900 hover:text-cbit-navy-800 text-sm block"
                      >
                        {item.full_name}
                      </Link>
                      <span className="text-slate-500 text-xs">{item.designation}</span>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {item.email} • {item.mobile_number}
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      {item.organisations && item.organisations.length > 0 ? (
                        <div className="flex items-center space-x-1 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-cbit-teal-600 shrink-0" />
                          <span className="truncate">{item.organisations[0].organisation_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No org linked</span>
                      )}

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.expertise &&
                          item.expertise.slice(0, 2).map((exp) => (
                            <span
                              key={exp.id}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {exp.expertise_name}
                            </span>
                          ))}
                        {item.expertise && item.expertise.length > 2 && (
                          <span className="text-[10px] text-slate-400">
                            +{item.expertise.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {item.creator_name || "System Admin"}
                    </td>

                    <td className="py-4 px-4 text-slate-500">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      {activeTab === "pending" ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setApprovingItem(item)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRejectingItem(item)}
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                          <Link href={`/resource-persons/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/resource-persons/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            View Record
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-500">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800">
            {activeTab === "pending"
              ? "All submissions reviewed"
              : `No ${activeTab} profiles found`}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === "pending"
              ? "There are currently no resource person submissions awaiting approval."
              : `Records will appear here as submissions are ${activeTab}.`}
          </p>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={Boolean(approvingItem)}
        onClose={() => setApprovingItem(null)}
        title="Approve Resource Person Submission"
        description="Approving will immediately publish this profile to the general directory."
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <p>
              <strong className="text-slate-900">Name:</strong> {approvingItem?.full_name}
            </p>
            <p>
              <strong className="text-slate-900">Designation:</strong> {approvingItem?.designation}
            </p>
            <p>
              <strong className="text-slate-900">Submitted by:</strong>{" "}
              {approvingItem?.creator_name}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Approval Notes / Comments (Optional)
            </label>
            <input
              type="text"
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-cbit-navy-800"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setApprovingItem(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              isLoading={approveMutation.isPending}
              onClick={() => {
                if (approvingItem) {
                  approveMutation.mutate({
                    id: approvingItem.id,
                    comments: approvalComments,
                  });
                }
              }}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal with Mandatory Rejection Reason */}
      <Modal
        isOpen={Boolean(rejectingItem)}
        onClose={() => setRejectingItem(null)}
        title="Reject Resource Person Submission"
        description="Specify the reason why this profile is being rejected so the submitting faculty can rectify it."
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
            <p>
              <strong>Rejecting candidate:</strong> {rejectingItem?.full_name} (
              {rejectingItem?.designation})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Rejection Reason *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Incomplete contact information, unverified organisation affiliation, duplicate entry..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-rose-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setRejectingItem(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectionReason.trim()}
              isLoading={rejectMutation.isPending}
              onClick={() => {
                if (rejectingItem && rejectionReason.trim()) {
                  rejectMutation.mutate({
                    id: rejectingItem.id,
                    rejection_reason: rejectionReason.trim(),
                    comments: rejectionComments.trim() || undefined,
                  });
                }
              }}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

