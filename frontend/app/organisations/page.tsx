"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Organisation } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrganisationCardSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  Building2,
  Search,
  ExternalLink,
  MapPin,
  Users,
  Building,
  Plus,
} from "lucide-react";

export default function OrganisationsDirectoryPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: organisations, isLoading, isError } = useQuery<Organisation[]>({
    queryKey: ["organisations", search, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (typeFilter) params.append("org_type", typeFilter);
      params.append("limit", "200");
      const res = await api.get(`/organisations?${params.toString()}`);
      return res.data;
    },
  });

  const orgTypes = ["Corporate", "Academic", "Research Institute", "Government", "NGO"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Partner Organisations Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse companies, universities, research bodies, and agencies associated with CBIT resource persons.
          </p>
        </div>

        {isAdmin && (
          <Link href="/admin/organisations">
            <Button size="md">
              <Building className="w-4 h-4 mr-1.5" />
              Manage Organisations
            </Button>
          </Link>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by organisation name or address..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-700 focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none bg-white"
        >
          <option value="">All Organisation Types</option>
          {orgTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Organisations Grid */}
      {isLoading ? (
        <OrganisationCardSkeleton count={6} />
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-800 text-sm">
          Failed to load organisations.
        </div>
      ) : organisations && organisations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {organisations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {org.organisation_name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 shrink-0">
                    {org.organisation_type}
                  </span>
                </div>

                {org.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {org.description}
                  </p>
                )}

                {org.address && (
                  <div className="flex items-start space-x-1.5 text-xs text-slate-500 mt-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{org.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-cbit-navy-800">
                  <Users className="w-3.5 h-3.5 text-cbit-teal-600" />
                  <span>{org.resource_person_count ?? 0} Resource Persons</span>
                </div>

                <Link
                  href={`/organisations/${org.id}`}
                  className="text-xs font-semibold text-cbit-teal-600 hover:text-cbit-teal-700 flex items-center"
                >
                  View Profiles <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-500">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800">No organisations found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting search criteria or adding new organisations.</p>
        </div>
      )}
    </div>
  );
}

