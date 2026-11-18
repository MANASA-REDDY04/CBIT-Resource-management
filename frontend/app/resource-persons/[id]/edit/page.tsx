"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Expertise, Organisation, ResourcePerson } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  ArrowLeft,
  Building2,
  Plus,
  Trash2,
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

interface OrgAssociationRow {
  organisation_id: string;
  designation: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export default function EditResourcePersonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [biography, setBiography] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [organisations, setOrganisations] = useState<OrgAssociationRow[]>([]);
  const [selectedExpertiseIds, setSelectedExpertiseIds] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1. Fetch Profile Details
  const { data: person, isLoading: personLoading } = useQuery<ResourcePerson>({
    queryKey: ["resource-person", id],
    queryFn: async () => {
      const res = await api.get(`/resource-persons/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  // 2. Fetch Available Organisations
  const { data: orgOptions } = useQuery<Organisation[]>({
    queryKey: ["organisations-list-all"],
    queryFn: async () => {
      const res = await api.get("/organisations?limit=500&is_active=true");
      return res.data;
    },
  });

  // 3. Fetch Available Expertise
  const { data: expOptions } = useQuery<Expertise[]>({
    queryKey: ["expertise-list-all"],
    queryFn: async () => {
      const res = await api.get("/expertise?limit=500&is_active=true");
      return res.data;
    },
  });

  // Populate state once fetched
  useEffect(() => {
    if (person) {
      setFullName(person.full_name || "");
      setDesignation(person.designation || "");
      setEmail(person.email || "");
      setMobileNumber(person.mobile_number || "");
      setAddress(person.address || "");
      setBiography(person.professional_biography || "");
      setProfileUrl(person.professional_profile_url || "");

      if (person.organisations && person.organisations.length > 0) {
        setOrganisations(
          person.organisations.map((o) => ({
            organisation_id: o.organisation_id,
            designation: o.designation,
            start_date: o.start_date ? o.start_date.substring(0, 10) : "",
            end_date: o.end_date ? o.end_date.substring(0, 10) : "",
            is_current: o.is_current,
          }))
        );
      } else {
        setOrganisations([
          {
            organisation_id: "",
            designation: "",
            start_date: "",
            end_date: "",
            is_current: true,
          },
        ]);
      }

      if (person.expertise) {
        setSelectedExpertiseIds(person.expertise.map((e) => e.id));
      }
    }
  }, [person]);

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

  const handleRemoveOrgRow = (index: number) => {
    setOrganisations(organisations.filter((_, i) => i !== index));
  };

  const handleUpdateOrgRow = (index: number, field: keyof OrgAssociationRow, value: any) => {
    const updated = [...organisations];
    updated[index] = { ...updated[index], [field]: value };
    setOrganisations(updated);
  };

  const handleToggleExpertise = (expId: string) => {
    if (selectedExpertiseIds.includes(expId)) {
      setSelectedExpertiseIds(selectedExpertiseIds.filter((x) => x !== expId));
    } else {
      setSelectedExpertiseIds([...selectedExpertiseIds, expId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const validOrgs = organisations
      .filter((o) => o.organisation_id && o.designation.trim())
      .map((o) => ({
        organisation_id: o.organisation_id,
        designation: o.designation.trim(),
        start_date: o.start_date || null,
        end_date: o.is_current ? null : o.end_date || null,
        is_current: o.is_current,
      }));

    setIsSaving(true);
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

      await api.put(`/resource-persons/${id}`, payload);
      setSuccessMsg("Resource person profile updated successfully.");
      setTimeout(() => {
        router.push(`/resource-persons/${id}`);
      }, 1200);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === "string" ? detail : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (personLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/resource-persons/${id}`}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-cbit-navy-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Profile
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Resource Person Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Update biographical data, organisation history, and mapped expertise.
          </p>
        </div>
      </div>

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
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Designation *"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Mobile Contact *"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Input
                label="Profile URL"
                type="url"
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
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Organisation associations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-cbit-teal-600" />
              Organisation Associations (Preserves History)
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOrgRow}>
              <Plus className="w-4 h-4 mr-1" />
              Add Association
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {organisations.map((orgRow, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">
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
                      id={`edit-current-${index}`}
                      checked={orgRow.is_current}
                      onChange={(e) => handleUpdateOrgRow(index, "is_current", e.target.checked)}
                      className="w-4 h-4 text-cbit-navy-800 rounded border-slate-300"
                    />
                    <label
                      htmlFor={`edit-current-${index}`}
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

        {/* Expertise Multi-select */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center">
              <Award className="w-4 h-4 mr-2 text-cbit-teal-600" />
              Areas of Expertise
            </CardTitle>
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/resource-persons/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile Updates
          </Button>
        </div>
      </form>
    </div>
  );
}

