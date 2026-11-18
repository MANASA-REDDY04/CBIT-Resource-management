"use client";

import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getRoleBadgeVariant, formatDateTime } from "@/lib/utils";
import { User, Mail, Shield, Building, Key, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const roleBadge = user?.role ? getRoleBadgeVariant(user.role) : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Staff Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Your institutional credentials and assigned permissions on CBIT Resource Hub.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-cbit-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <CardTitle className="text-xl font-bold text-slate-900">
                {user?.full_name}
              </CardTitle>
              {roleBadge && (
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                >
                  {roleBadge.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Employee Identifier
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {user?.employee_id || "Not assigned"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                College Department
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {user?.department_name
                  ? `${user.department_name} (${user.department_code})`
                  : "General Administration"}
              </span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Granted Record Permissions
            </span>
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    user?.can_create_records ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                <span className="font-medium text-slate-700">
                  Profile Creation: {user?.can_create_records ? "Granted" : "Restricted"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    user?.can_edit_records ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                <span className="font-medium text-slate-700">
                  Profile Editing: {user?.can_edit_records ? "Granted" : "Restricted"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Last Activity Session
              </span>
              <span className="text-xs text-slate-600">
                {formatDateTime(user?.last_login_at)}
              </span>
            </div>

            <Button variant="danger" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

