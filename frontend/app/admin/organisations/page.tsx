"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Organisation } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { DataTableSkeleton } from "@/components/ui/LoadingSkeleton";
import { Building2, Plus, Edit, Search, AlertCircle, Building, Users } from "lucide-react";

export default function AdminOrganisationsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);

  // Form State
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("Corporate");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  const { data: organisations, isLoading } = useQuery<Organisation[]>({
    queryKey: ["admin-organisations", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      params.append("limit", "250");
      const res = await api.get(`/organisations?${params.toString()}`);
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingOrg) {
        const res = await api.put(`/organisations/${editingOrg.id}`, payload);
        return res.data;
      } else {
        const res = await api.post("/organisations", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organisations"] });
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "Failed to save organisation.");
    },
  });

  const resetForm = () => {
    setEditingOrg(null);
    setOrgName("");
    setOrgType("Corporate");
    setWebsite("");
    setAddress("");
    setDescription("");
    setIsActive(true);
    setFormError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: Organisation) => {
    setEditingOrg(org);
    setOrgName(org.organisation_name);
    setOrgType(org.organisation_type);
    setWebsite(org.website || "");
    setAddress(org.address || "");
    setDescription(org.description || "");
    setIsActive(org.is_active);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setFormError("Organisation name is required.");
      return;
    }

    saveMutation.mutate({
      organisation_name: orgName.trim(),
      organisation_type: orgType,
      website: website.trim() || undefined,
      address: address.trim() || undefined,
      description: description.trim() || undefined,
      is_active: isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <Building className="w-6 h-6 mr-2 text-cbit-navy-800" />
            Organisation Master Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain partnering corporations, academic institutions, and research labs.
          </p>
        </div>

        <Button size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Organisation
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organisation by name or location..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {isLoading ? (
        <DataTableSkeleton rows={6} cols={6} />
      ) : organisations && organisations.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">Organisation Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Associated Persons</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organisations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{org.organisation_name}</span>
                      {org.website && (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-cbit-teal-600 hover:underline"
                        >
                          {org.website}
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{org.organisation_type}</td>
                    <td className="py-3.5 px-4 text-slate-500">{org.address || "—"}</td>
                    <td className="py-3.5 px-4 font-semibold text-cbit-navy-800">
                      {org.resource_person_count ?? 0} persons
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          org.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {org.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(org)}>
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-500">
          No organisations found.
        </div>
      )}

      {/* Modal: Create/Edit Organisation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrg ? "Edit Organisation" : "Add New Organisation"}
        description="Provide verified details of partnering entity."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Organisation Name *"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. Google India, IIIT Hyderabad"
            required
          />

          <Select
            label="Organisation Type *"
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
          >
            <option value="Corporate">Corporate / Industry</option>
            <option value="Academic">Academic / University</option>
            <option value="Research Institute">Research Institute</option>
            <option value="Government">Government / Public Sector</option>
            <option value="NGO">Non-Governmental Organisation (NGO)</option>
          </Select>

          <Input
            label="Official Website URL"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />

          <Input
            label="Campus / Office Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="City, State"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-cbit-navy-800"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="org-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-cbit-navy-800"
            />
            <label htmlFor="org-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Organisation is currently active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Save Organisation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

