"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Expertise } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { DataTableSkeleton } from "@/components/ui/LoadingSkeleton";
import { Layers, Plus, Edit, Search, AlertCircle, Lightbulb } from "lucide-react";

export default function AdminExpertisePage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Expertise | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Artificial Intelligence");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  const { data: categories } = useQuery<string[]>({
    queryKey: ["admin-expertise-categories"],
    queryFn: async () => {
      const res = await api.get("/expertise/categories");
      return res.data;
    },
  });

  const { data: expertiseList, isLoading } = useQuery<Expertise[]>({
    queryKey: ["admin-expertise-list", search, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (categoryFilter) params.append("category", categoryFilter);
      params.append("limit", "250");
      const res = await api.get(`/expertise?${params.toString()}`);
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingExp) {
        const res = await api.put(`/expertise/${editingExp.id}`, payload);
        return res.data;
      } else {
        const res = await api.post("/expertise", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-expertise-list"] });
      queryClient.invalidateQueries({ queryKey: ["expertise-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "Failed to save expertise topic.");
    },
  });

  const resetForm = () => {
    setEditingExp(null);
    setName("");
    setCategory("Artificial Intelligence");
    setDescription("");
    setIsActive(true);
    setFormError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expertise) => {
    setEditingExp(exp);
    setName(exp.expertise_name);
    setCategory(exp.category);
    setDescription(exp.description || "");
    setIsActive(exp.is_active);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) {
      setFormError("Name and category are required.");
      return;
    }

    saveMutation.mutate({
      expertise_name: name.trim(),
      category: category.trim(),
      description: description.trim() || undefined,
      is_active: isActive,
    });
  };

  const standardCategories = [
    "Artificial Intelligence",
    "Data Analytics",
    "Software Engineering",
    "Infrastructure",
    "Security",
    "Hardware & Embedded",
    "Management & Interdisciplinary",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <Layers className="w-6 h-6 mr-2 text-cbit-navy-800" />
            Expertise & Domain Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain subject matter domains, research topics, and technological classifications.
          </p>
        </div>

        <Button size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Expertise Topic
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expertise by topic or keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-700 bg-white focus:border-cbit-navy-800 outline-none"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <DataTableSkeleton rows={6} cols={6} />
      ) : expertiseList && expertiseList.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">Expertise Topic</th>
                  <th className="py-3 px-4">Domain Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Associated Persons</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expertiseList.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{exp.expertise_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-cbit-teal-50 text-cbit-teal-800 font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">
                      {exp.description || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-cbit-navy-800">
                      {exp.resource_person_count ?? 0} persons
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          exp.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {exp.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(exp)}>
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
          No expertise topics found.
        </div>
      )}

      {/* Modal: Create/Edit Expertise */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExp ? "Edit Expertise Topic" : "Add New Expertise Topic"}
        description="Configure topic name and institutional research classification."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Expertise Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Generative AI, VLSI Design, Robotics"
            required
          />

          <Select
            label="Domain Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {standardCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Topic Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keywords, algorithms, tools or subdomains covered..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-cbit-navy-800"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="exp-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-cbit-navy-800"
            />
            <label htmlFor="exp-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Topic is active and selectable by faculty
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Save Topic
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

