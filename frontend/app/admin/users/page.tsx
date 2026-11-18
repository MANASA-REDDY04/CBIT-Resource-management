"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Department, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DataTableSkeleton } from "@/components/ui/LoadingSkeleton";
import { getRoleBadgeVariant, formatDate, formatDateTime } from "@/lib/utils";
import {
  UserCog,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Key,
  Building,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<User | null>(null);

  // New User Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("GENERAL_STAFF");
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [formError, setFormError] = useState("");

  // Permissions Edit State
  const [editRole, setEditRole] = useState("GENERAL_STAFF");
  const [editCanCreate, setEditCanCreate] = useState(false);
  const [editCanEdit, setEditCanEdit] = useState(false);

  // Fetch Users
  const { data: usersData, isLoading } = useQuery<{ items: User[]; total: number }>({
    queryKey: ["admin-users", search, roleFilter, deptFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (roleFilter) params.append("role", roleFilter);
      if (deptFilter) params.append("department_id", deptFilter);
      params.append("limit", "100");
      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  // Fetch Departments for select dropdown
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments-all"],
    queryFn: async () => {
      const res = await api.get("/departments?active_only=true");
      return res.data;
    },
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/admin/users", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsCreateOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "Failed to create user account.");
    },
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Update Permissions Mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
      canCreate,
      canEdit,
    }: {
      userId: string;
      role: string;
      canCreate: boolean;
      canEdit: boolean;
    }) => {
      const res = await api.patch(`/admin/users/${userId}/permissions`, {
        role,
        can_create_records: canCreate,
        can_edit_records: canEdit,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingPermissionsUser(null);
    },
  });

  const resetCreateForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setEmployeeId("");
    setDepartmentId("");
    setRole("GENERAL_STAFF");
    setCanCreate(false);
    setCanEdit(false);
    setFormError("");
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole === "ADMIN") {
      setCanCreate(true);
      setCanEdit(true);
    } else if (newRole === "AUTHORISED_FACULTY") {
      setCanCreate(true);
      setCanEdit(false);
    } else {
      setCanCreate(false);
      setCanEdit(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setFormError("Full Name, Email, and Password are required.");
      return;
    }

    createMutation.mutate({
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      employee_id: employeeId.trim() || undefined,
      department_id: departmentId || undefined,
      role,
      can_create_records: canCreate,
      can_edit_records: canEdit,
      is_active: true,
    });
  };

  const openPermissionsModal = (user: User) => {
    setEditingPermissionsUser(user);
    setEditRole(user.role);
    setEditCanCreate(user.can_create_records);
    setEditCanEdit(user.can_edit_records);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <UserCog className="w-6 h-6 mr-2 text-cbit-navy-800" />
            Staff Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer institutional faculty accounts, assign roles, departments, and submission privileges.
          </p>
        </div>

        <Button size="md" onClick={() => setIsCreateOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Create Staff Account
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, employee ID..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 bg-white focus:border-cbit-navy-800 outline-none"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">System Admin</option>
          <option value="AUTHORISED_FACULTY">Authorised Faculty</option>
          <option value="GENERAL_STAFF">General Staff</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 bg-white focus:border-cbit-navy-800 outline-none"
        >
          <option value="">All Departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_code} - {d.department_name}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <DataTableSkeleton rows={6} cols={6} />
      ) : usersData?.items && usersData.items.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department & Emp ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {usersData.items.map((u) => {
                  const roleBadge = getRoleBadgeVariant(u.role);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{u.full_name}</span>
                        <span className="text-slate-500 text-[11px]">{u.email}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {u.department_code ? (
                          <span className="font-semibold">{u.department_code}</span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                        {u.employee_id && (
                          <span className="block text-[11px] text-slate-400">{u.employee_id}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.5 rounded mr-1 ${
                              u.can_create_records
                                ? "bg-emerald-50 text-emerald-700 font-semibold"
                                : "bg-slate-100 text-slate-400 line-through"
                            }`}
                          >
                            Create
                          </span>
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${
                              u.can_edit_records
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "bg-slate-100 text-slate-400 line-through"
                            }`}
                          >
                            Edit
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              userId: u.id,
                              isActive: !u.is_active,
                            })
                          }
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            u.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {u.is_active ? "Active" : "Deactivated"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {formatDateTime(u.last_login_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPermissionsModal(u)}
                        >
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          Permissions
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-500">
          <p>No staff accounts found matching filter.</p>
        </div>
      )}

      {/* Modal: Create Staff Account */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Staff Account"
        description="Add a college faculty or administrator account with credentials."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name *"
              placeholder="e.g. Dr. Rajeshwari Rao"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Institutional Email *"
              type="email"
              placeholder="rajeshwari@cbit.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Initial Password *"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Employee ID"
              placeholder="e.g. CBIT-FAC-204"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Select Department...</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name} ({d.department_code})
                </option>
              ))}
            </Select>

            <Select
              label="System Role *"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="GENERAL_STAFF">General College Staff (Directory Read)</option>
              <option value="AUTHORISED_FACULTY">Authorised Faculty (Submit Profiles)</option>
              <option value="ADMIN">System Administrator (Full Permissions)</option>
            </Select>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Granular Record Permissions
            </span>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canCreate}
                  onChange={(e) => setCanCreate(e.target.checked)}
                  className="rounded text-cbit-navy-800 focus:ring-cbit-navy-500"
                />
                <span>Can create resource persons</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canEdit}
                  onChange={(e) => setCanEdit(e.target.checked)}
                  className="rounded text-cbit-navy-800 focus:ring-cbit-navy-500"
                />
                <span>Can edit existing profiles</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={createMutation.isPending}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Permissions */}
      <Modal
        isOpen={Boolean(editingPermissionsUser)}
        onClose={() => setEditingPermissionsUser(null)}
        title="Edit User Permissions & Role"
        description={`Update role permissions for ${editingPermissionsUser?.full_name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Select
            label="Assigned Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          >
            <option value="GENERAL_STAFF">General Staff</option>
            <option value="AUTHORISED_FACULTY">Authorised Faculty</option>
            <option value="ADMIN">System Administrator</option>
          </Select>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={editCanCreate}
                onChange={(e) => setEditCanCreate(e.target.checked)}
                className="rounded text-cbit-navy-800"
              />
              <span>Can create resource persons</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={editCanEdit}
                onChange={(e) => setEditCanEdit(e.target.checked)}
                className="rounded text-cbit-navy-800"
              />
              <span>Can edit records</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingPermissionsUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={updatePermissionsMutation.isPending}
              onClick={() => {
                if (editingPermissionsUser) {
                  updatePermissionsMutation.mutate({
                    userId: editingPermissionsUser.id,
                    role: editRole,
                    canCreate: editCanCreate,
                    canEdit: editCanEdit,
                  });
                }
              }}
            >
              Save Permissions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

