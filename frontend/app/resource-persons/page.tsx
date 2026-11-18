"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { PaginatedResult, ResourcePerson } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { ResourcePersonCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { getStatusBadgeVariant } from "@/lib/utils";
import {
  Search,
  Filter,
  X,
  UserPlus,
  Building2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export default function ResourcePersonsDirectoryPage() {
  const { user } = useAuthStore();
  const canCreate = user?.role === "ADMIN" || user?.can_create_records;

  // Search filter states
  const [q, setQ] = useState("");
  const [fullName, setFullName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [expertise, setExpertise] = useState("");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Active query parameters applied on search
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    full_name: "",
    organisation: "",
    expertise: "",
    designation: "",
    address: "",
    email: "",
    mobile: "",
  });

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResult<ResourcePerson>>({
    queryKey: ["resource-persons", appliedFilters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (appliedFilters.q) params.append("q", appliedFilters.q);
      if (appliedFilters.full_name) params.append("full_name", appliedFilters.full_name);
      if (appliedFilters.organisation) params.append("organisation", appliedFilters.organisation);
      if (appliedFilters.expertise) params.append("expertise", appliedFilters.expertise);
      if (appliedFilters.designation) params.append("designation", appliedFilters.designation);
      if (appliedFilters.address) params.append("address", appliedFilters.address);
      if (appliedFilters.email) params.append("email", appliedFilters.email);
      if (appliedFilters.mobile) params.append("mobile", appliedFilters.mobile);
      params.append("approval_status", "APPROVED");
      params.append("page", page.toString());
      params.append("limit", "9");

      const res = await api.get(`/resource-persons?${params.toString()}`);
      return res.data;
    },
  });

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters({
      q: q.trim(),
      full_name: fullName.trim(),
      organisation: organisation.trim(),
      expertise: expertise.trim(),
      designation: designation.trim(),
      address: address.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
    });
  };

  const handleClearFilters = () => {
    setQ("");
    setFullName("");
    setOrganisation("");
    setExpertise("");
    setDesignation("");
    setAddress("");
    setEmail("");
    setMobile("");
    setPage(1);
    setAppliedFilters({
      q: "",
      full_name: "",
      organisation: "",
      expertise: "",
      designation: "",
      address: "",
      email: "",
      mobile: "",
    });
  };

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resource Person Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified institutional external resource persons by expertise, organisation, designation, and contact details.
          </p>
        </div>

        {canCreate && (
          <Link href="/resource-persons/new">
            <Button size="md" className="shrink-0">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add Resource Person
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleApplySearch} className="space-y-4">
          {/* Global Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by full name, expertise, organisation, designation..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <Button type="submit" variant="primary" size="md">
              <Search className="w-4 h-4 mr-1.5" />
              Search
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={showAdvancedFilters ? "bg-slate-100" : ""}
            >
              <Filter className="w-4 h-4 mr-1.5" />
              Detailed Filters
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="md" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-1.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Multi-Filter Fields */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-in fade-in">
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Organisation"
                placeholder="e.g. Wipro, Google, ISRO"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
              />
              <Input
                label="Expertise Topic"
                placeholder="e.g. Generative AI, Cloud"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
              />
              <Input
                label="Designation"
                placeholder="e.g. Director, Principal Architect"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
              <Input
                label="Address / City"
                placeholder="e.g. Hyderabad, Bangalore"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Input
                label="Email ID"
                placeholder="e.g. name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Mobile Number"
                placeholder="e.g. 98480"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          )}
        </form>
      </div>

      {/* Directory Grid / Loading / Empty State */}
      {isLoading ? (
        <ResourcePersonCardSkeleton count={6} />
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center text-rose-800">
          <p className="font-semibold">Unable to load resource persons.</p>
          <p className="text-sm mt-1">Please ensure the backend is running and connected to PostgreSQL.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
            Retry Connection
          </Button>
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.items.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Name & Designation */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/resource-persons/${person.id}`}
                        className="text-base font-bold text-slate-900 hover:text-cbit-navy-800 transition-colors line-clamp-1"
                      >
                        {person.full_name}
                      </Link>
                      <p className="text-xs font-medium text-cbit-navy-700 mt-0.5 line-clamp-1">
                        {person.designation}
                      </p>
                    </div>
                    <Badge variant="success" className="shrink-0">
                      Approved
                    </Badge>
                  </div>

                  {/* Organisation Badge */}
                  <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Building2 className="w-3.5 h-3.5 text-cbit-teal-600 shrink-0" />
                    <span className="font-medium truncate">
                      {person.organisations && person.organisations.length > 0
                        ? `${person.organisations[0].organisation_name} (${person.organisations[0].designation})`
                        : "No organisation linked"}
                    </span>
                  </div>

                  {/* Contact Info (Visible to Authenticated College Staff) */}
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center space-x-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{person.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{person.mobile_number}</span>
                    </div>
                    {person.address && (
                      <div className="flex items-center space-x-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{person.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Expertise Areas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {person.expertise && person.expertise.length > 0 ? (
                        person.expertise.slice(0, 3).map((exp) => (
                          <span
                            key={exp.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cbit-teal-50 text-cbit-teal-800 border border-cbit-teal-100"
                          >
                            {exp.expertise_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No expertise tagged</span>
                      )}
                      {person.expertise && person.expertise.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          +{person.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/resource-persons/${person.id}`}
                    className="text-xs font-semibold text-cbit-navy-800 hover:text-cbit-teal-700 transition-colors inline-flex items-center"
                  >
                    View Full Profile
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Link>

                  {(user?.role === "ADMIN" || user?.can_edit_records) && (
                    <Link href={`/resource-persons/${person.id}/edit`}>
                      <span className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
                        Edit
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            totalItems={data.total}
            pageSize={9}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No approved resource persons found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? "No resource persons match your filter criteria. Try adjusting or clearing search terms."
              : "No approved profiles in the database. Add a new profile or approve pending submissions in the Admin Panel."}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">
              Clear All Filters
            </Button>
          ) : canCreate ? (
            <Link href="/resource-persons/new">
              <Button size="sm" className="mt-4">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add First Resource Person
              </Button>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

