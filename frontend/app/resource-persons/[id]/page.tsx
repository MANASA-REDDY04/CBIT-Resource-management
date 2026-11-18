"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { ResourcePerson } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfileDetailSkeleton } from "@/components/ui/LoadingSkeleton";
import { getStatusBadgeVariant, formatDate, formatDateTime } from "@/lib/utils";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Clock,
  ArrowLeft,
  Edit,
  ShieldCheck,
  Award,
  History,
  User,
} from "lucide-react";

export default function ResourcePersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const { data: person, isLoading, isError } = useQuery<ResourcePerson>({
    queryKey: ["resource-person", id],
    queryFn: async () => {
      const res = await api.get(`/resource-persons/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <ProfileDetailSkeleton />;
  }

  if (isError || !person) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-rose-800">
          <h3 className="font-bold text-lg">Resource Person Not Found</h3>
          <p className="text-sm mt-1 text-rose-600">
            The requested profile may not exist or is pending review without authorization to view.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push("/resource-persons")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadgeVariant(person.approval_status);
  const canEdit =
    user?.role === "ADMIN" ||
    (user?.can_edit_records && (user.role === "AUTHORISED_FACULTY" || person.created_by === user?.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/resource-persons"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-cbit-navy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Resource Person Directory
        </Link>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <Link href={`/resource-persons/${person.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1.5" />
                Edit Profile
              </Button>
            </Link>
          )}

          {user?.role === "ADMIN" && person.approval_status === "PENDING" && (
            <Link href="/admin/approvals">
              <Button variant="primary" size="sm">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Review in Approvals Queue
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-cbit-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {person.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {person.full_name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                >
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-sm font-medium text-cbit-navy-800 mt-1">
                {person.designation}
              </p>
            </div>
          </div>

          {person.professional_profile_url && (
            <a
              href={person.professional_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-4 h-4 mr-1.5 text-cbit-teal-600" />
              Professional Profile
            </a>
          )}
        </div>

        {/* Contact Details Grid (Visible only to Authenticated College Staff) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Mail className="w-4 h-4 text-cbit-navy-800 mt-0.5 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </span>
              <a
                href={`mailto:${person.email}`}
                className="text-xs font-medium text-slate-800 hover:underline truncate block"
              >
                {person.email}
              </a>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Phone className="w-4 h-4 text-cbit-navy-800 mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Mobile Number
              </span>
              <a
                href={`tel:${person.mobile_number}`}
                className="text-xs font-medium text-slate-800 hover:underline"
              >
                {person.mobile_number}
              </a>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <MapPin className="w-4 h-4 text-cbit-navy-800 mt-0.5 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Location / Address
              </span>
              <p className="text-xs font-medium text-slate-800 truncate">
                {person.address || "Location not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Biography & Organisations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">
                Professional Biography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {person.professional_biography || "No biography provided."}
              </p>
            </CardContent>
          </Card>

          {/* Organisation Associations (Current & Historical) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-cbit-teal-600" />
                Organisation Associations & History
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 pt-2">
              {person.organisations && person.organisations.length > 0 ? (
                person.organisations.map((org, idx) => (
                  <div key={org.id || idx} className="py-4 first:pt-1 last:pb-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {org.organisation_name}
                        </h4>
                        <p className="text-xs font-medium text-cbit-navy-800 mt-0.5">
                          {org.designation}
                        </p>
                        {org.organisation_type && (
                          <span className="text-[11px] text-slate-400">
                            Type: {org.organisation_type}
                          </span>
                        )}
                      </div>
                      <Badge variant={org.is_current ? "success" : "default"}>
                        {org.is_current ? "Current Association" : "Past Association"}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center text-xs text-slate-500 space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {formatDate(org.start_date)} — {formatDate(org.end_date)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No organisation history recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Expertise Areas & Metadata */}
        <div className="space-y-6">
          {/* Expertise Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center">
                <Award className="w-4 h-4 mr-2 text-cbit-teal-600" />
                Areas of Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {person.expertise && person.expertise.length > 0 ? (
                  person.expertise.map((exp) => (
                    <div
                      key={exp.id}
                      className="px-2.5 py-1.5 rounded-lg bg-cbit-teal-50/70 border border-cbit-teal-200/70 text-cbit-teal-900 text-xs font-medium"
                    >
                      <span className="font-semibold">{exp.expertise_name}</span>
                      <span className="block text-[10px] text-cbit-teal-700">
                        {exp.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No expertise areas tagged.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit & Submission Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center">
                <History className="w-4 h-4 mr-2 text-slate-500" />
                Record Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block font-medium">Added to System</span>
                <span>{formatDateTime(person.created_at)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Last Modified</span>
                <span>{formatDateTime(person.updated_at)}</span>
              </div>
              {person.creator_name && (
                <div>
                  <span className="text-slate-400 block font-medium">Submitted By</span>
                  <span className="font-medium text-slate-800">{person.creator_name}</span>
                </div>
              )}
              {person.reviewer_name && (
                <div>
                  <span className="text-slate-400 block font-medium">Reviewed By</span>
                  <span className="font-medium text-slate-800">
                    {person.reviewer_name} ({formatDateTime(person.reviewed_at)})
                  </span>
                </div>
              )}
              {person.rejection_reason && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold block">Rejection Reason:</span>
                  <span>{person.rejection_reason}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

