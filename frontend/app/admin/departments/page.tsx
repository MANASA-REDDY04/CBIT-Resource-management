"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Department } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DataTableSkeleton } from "@/components/ui/LoadingSkeleton";
import { GraduationCap, Plus, Edit, AlertCircle, Users } from "lucide-react";

export default function AdminDepartmentsPage() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ["admin-departments"],
    queryFn: async () => {
      const res = await api.get("/departments");
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingDept) {
        const res = await api.put(`/departments/${editingDept.id}`, payload);
        return res.data;
      } else {
        const res = await api.post("/departments", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments-all"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "Failed to save department.");
    },
  });

  const resetForm = () => {
    setEditingDept(null);
    setName("");
    setCode("");
    setDescription("");
    setIsActive(true);
    setFormError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.department_name);
    setCode(dept.department_code);
    setDescription(dept.description || "");
    setIsActive(dept.is_active);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError("Department name and short code are required.");
      return;
    }

    saveMutation.mutate({
      department_name: name.trim(),
      department_code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      is_active: isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <GraduationCap className="w-6 h-6 mr-2 text-cbit-navy-800" />
            College Department Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure academic departments for staff affiliation and resource allocations.
          </p>
        </div>

        <Button size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Department
        </Button>
      </div>

      {isLoading ? (
        <DataTableSkeleton rows={6} cols={6} />
      ) : departments && departments.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Short Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Affiliated Staff</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{dept.department_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                        {dept.department_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">
                      {dept.description || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-cbit-navy-800">
                      {dept.staff_count ?? 0} staff members
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          dept.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {dept.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(dept)}>
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
          No departments configured.
        </div>
      )}

      {/* Modal: Create/Edit Department */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? "Edit Department" : "Add New Department"}
        description="Configure academic branch name and identifier."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Department Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Computer Science and Engineering"
            required
          />

          <Input
            label="Department Code (Acronym) *"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CSE, IT, AI&ML"
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Department overview..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-cbit-navy-800"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="dept-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-cbit-navy-800"
            />
            <label htmlFor="dept-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Department is active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

