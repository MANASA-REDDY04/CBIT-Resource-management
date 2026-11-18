"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Expertise, Organisation } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  UserPlus,
  ArrowLeft,
  Building2,
  Plus,
  Trash2,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface OrgAssociationRow {
  organisation_id: string;
  designation: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export default function AddResourcePersonPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  // Form State
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [biography, setBiography] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  // Organisation associations state
  const [organisations, setOrganisations] = useState<OrgAssociationRow[]>([
    {
      organisation_id: "",
      designation: "",
      start_date: "",
      end_date: "",
      is_current: true,
    },
  ]);

  // Selected expertise IDs
  const [selectedExpertiseIds, setSelectedExpertiseIds] = useState<string[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch available organisations
  const { data: orgOptions } = useQuery<Organisation[]>({
    queryKey: ["organisations-list-all"],
    queryFn: async () => {
      const res = await api.get("/organisations?limit=500&is_active=true");
      return res.data;
    },
  });

  // Fetch available expertise
  const { data: expOptions } = useQuery<Expertise[]>({
    queryKey: ["expertise-list-all"],
    queryFn: async () => {
      const res = await api.get("/expertise?limit=500&is_active=true");
      return res.data;
    },
  });

  // Add organisation association row
  const handleAddOrgRow = () => {
    setOrganisations([
      ...organisations,
      {
        organisation_id: "",
        designation: "",
        start_date: "",
        end_date: "",
        is_current: false,
      },
    ]);
  };

  // Remove organisation association row
  const handleRemoveOrgRow = (index: number) => {
    setOrganisations(organisations.filter((_, i) => i !== index));
  };

  // Update organisation association row
  const handleUpdateOrgRow = (index: number, field: keyof OrgAssociationRow, value: any) => {
    const updated = [...organisations];
    updated[index] = { ...updated[index], [field]: value };
    setOrganisations(updated);
  };

  // Toggle expertise selection
  const handleToggleExpertise = (expId: string) => {
    if (selectedExpertiseIds.includes(expId)) {
      setSelectedExpertiseIds(selectedExpertiseIds.filter((id) => id !== expId));
    } else {
      setSelectedExpertiseIds([...selectedExpertiseIds, expId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim() || !designation.trim() || !email.trim() || !mobileNumber.trim()) {
      setErrorMsg("Please fill in all required fields (Full Name, Designation, Email, Mobile).");
      return;
    }

    // Filter valid organisations (must have organisation_id and designation)
    const validOrgs = organisations
      .filter((o) => o.organisation_id && o.designation.trim())
      .map((o) => ({
        organisation_id: o.organisation_id,
        designation: o.designation.trim(),
        start_date: o.start_date ? o.start_date : null,
        end_date: o.is_current ? null : o.end_date ? o.end_date : null,
        is_current: o.is_current,
      }));

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        designation: designation.trim(),
        email: email.trim(),
        mobile_number: mobileNumber.trim(),
        address: address.trim() || null,
        professional_biography: biography.trim() || null,
        professional_profile_url: profileUrl.trim() || null,
        organisations: validOrgs,
        expertise_ids: selectedExpertiseIds,
      };

      const res = await api.post("/resource-persons", payload);

      if (isAdmin) {
        setSuccessMsg("Resource person created and approved successfully.");
      } else {
        setSuccessMsg(
          "Resource person profile submitted successfully! It has been placed in the PENDING queue for administrative review."
        );
      }

      setTimeout(() => {
        router.push(`/resource-persons/${res.data.id}`);
      }, 1500);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === "string" ? detail : "Failed to create resource person. Please verify details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/resource-persons"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-cbit-navy-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Directory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Add New Resource Person
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Register external expert, industry professional or guest faculty.
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start space-x-3 text-xs text-blue-800">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Institutional Submission Policy</span>
            As an Authorised Faculty member, your submission will automatically receive{" "}
            <span className="font-bold underline">PENDING</span> status. It will become visible in
            the general directory once approved by the College Administrator.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start space-x-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start space-x-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              1. Professional & Contact Details
            </CardTitle>
            <CardDescription className="text-xs">
              Primary identity and verified contact details of the resource person.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Dr. Ramesh Kumar Varma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Current Professional Designation *"
                placeholder="e.g. Director of Artificial Intelligence"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Professional Email *"
                type="email"
                placeholder="e.g. ramesh.varma@wipro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Mobile Contact Number *"
                placeholder="e.g. +91 98480 12345"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location / Office Address"
                placeholder="e.g. Plot 23, Jubilee Hills, Hyderabad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Input
                label="Professional Profile URL (LinkedIn / Google Scholar)"
                type="url"
                placeholder="https://linkedin.com/in/profile"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Professional Biography
              </label>
              <textarea
                rows={4}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Brief summary of domain contributions, academic achievements, research areas, and industry experience..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Organisation Associations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-cbit-teal-600" />
                2. Organisation Associations (Current & Historical)
              </CardTitle>
              <CardDescription className="text-xs">
                Associate companies, research bodies, or academic institutes with role history.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOrgRow}>
              <Plus className="w-4 h-4 mr-1" />
              Add Association
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {organisations.map((orgRow, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Association #{index + 1}
                  </span>
                  {organisations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOrgRow(index)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Organisation *"
                    value={orgRow.organisation_id}
                    onChange={(e) =>
                      handleUpdateOrgRow(index, "organisation_id", e.target.value)
                    }
                  >
                    <option value="">Select Organisation...</option>
                    {orgOptions?.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.organisation_name} ({o.organisation_type})
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Designation in Organisation *"
                    placeholder="e.g. Lead Consultant, Scientist"
                    value={orgRow.designation}
                    onChange={(e) => handleUpdateOrgRow(index, "designation", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <Input
                    label="Start Date"
                    type="date"
                    value={orgRow.start_date}
                    onChange={(e) => handleUpdateOrgRow(index, "start_date", e.target.value)}
                  />

                  {!orgRow.is_current ? (
                    <Input
                      label="End Date"
                      type="date"
                      value={orgRow.end_date}
                      onChange={(e) => handleUpdateOrgRow(index, "end_date", e.target.value)}
                    />
                  ) : (
                    <div className="text-xs text-slate-500 py-2.5">End Date: Present</div>
                  )}

                  <div className="flex items-center space-x-2 pb-2.5">
                    <input
                      type="checkbox"
                      id={`current-check-${index}`}
                      checked={orgRow.is_current}
                      onChange={(e) => handleUpdateOrgRow(index, "is_current", e.target.checked)}
                      className="w-4 h-4 text-cbit-navy-800 rounded border-slate-300 focus:ring-cbit-navy-500"
                    />
                    <label
                      htmlFor={`current-check-${index}`}
                      className="text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Current Association
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section 3: Areas of Expertise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center">
              <Award className="w-4 h-4 mr-2 text-cbit-teal-600" />
              3. Areas of Expertise
            </CardTitle>
            <CardDescription className="text-xs">
              Select one or more domain topics mapped to this resource person.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expOptions?.map((exp) => {
                const isSelected = selectedExpertiseIds.includes(exp.id);
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => handleToggleExpertise(exp.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-cbit-teal-600 text-white border-cbit-teal-700 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{exp.expertise_name}</span>
                    <span className="block text-[10px] opacity-75">{exp.category}</span>
                  </button>
                );
              })}
            </div>
            {selectedExpertiseIds.length === 0 && (
              <p className="text-xs text-slate-400 mt-2 italic">
                No expertise selected yet. Click topics above to select.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/resource-persons")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <UserPlus className="w-4 h-4 mr-1.5" />
            {isAdmin ? "Create & Approve Profile" : "Submit for Approval"}
          </Button>
        </div>
      </form>
    </div>
  );
}

