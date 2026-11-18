"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Organisation } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton, ActivityFeedSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatDate } from "@/lib/utils";
import {
  Building2,
  Globe,
  MapPin,
  ArrowLeft,
  Users,
  ExternalLink,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

export default function OrganisationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  // 1. Fetch Organisation details
  const { data: org, isLoading: orgLoading } = useQuery<Organisation>({
    queryKey: ["organisation", id],
    queryFn: async () => {
      const res = await api.get(`/organisations/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  // 2. Fetch Associated Resource Persons
  const { data: persons, isLoading: personsLoading } = useQuery<any[]>({
    queryKey: ["organisation-resource-persons", id],
    queryFn: async () => {
      const res = await api.get(`/organisations/${id}/resource-persons`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  if (orgLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-4 w-36" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-20 md:col-span-2 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <ActivityFeedSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-rose-600 font-semibold">Organisation not found.</p>
        <Link href="/organisations">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          href="/organisations"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-cbit-navy-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Organisations
        </Link>
      </div>

      {/* Hero Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-cbit-navy-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-900">{org.organisation_name}</h1>
                <Badge variant="outline">{org.organisation_type}</Badge>
              </div>
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-cbit-teal-600 hover:underline mt-1"
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  {org.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              About Organisation
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {org.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Address
            </h4>
            <div className="flex items-start space-x-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>{org.address || "Address not provided."}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Associated Resource Persons List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-cbit-teal-600" />
            Associated CBIT Resource Persons ({persons?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 pt-3">
          {personsLoading ? (
            <ActivityFeedSkeleton count={3} />
          ) : persons && persons.length > 0 ? (
            persons.map((person) => (
              <div
                key={person.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <Link
                    href={`/resource-persons/${person.id}`}
                    className="text-sm font-bold text-slate-900 hover:text-cbit-navy-800 transition-colors"
                  >
                    {person.full_name}
                  </Link>
                  <p className="text-xs font-medium text-cbit-navy-700 mt-0.5">
                    {person.organisation_designation || person.primary_designation}
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1.5">
                    <span className="flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-slate-400" />
                      {person.email}
                    </span>
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-slate-400" />
                      {person.mobile_number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={person.is_current ? "success" : "default"}>
                    {person.is_current ? "Current" : "Historical"}
                  </Badge>
                  <Link href={`/resource-persons/${person.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 py-6 text-center">
              No approved resource persons currently mapped to this organisation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

