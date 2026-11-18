"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn, getRoleBadgeVariant } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Lightbulb,
  UserPlus,
  ShieldCheck,
  UserCog,
  LogOut,
  GraduationCap,
  FileCheck2,
  Building,
  Layers,
} from "lucide-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";
  const canCreate = user?.role === "ADMIN" || user?.can_create_records;

  const navItems = [
    {
      title: "Main Directory",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Resource Persons", href: "/resource-persons", icon: Users },
        { label: "Organisations", href: "/organisations", icon: Building2 },
        { label: "Expertise Areas", href: "/expertise", icon: Lightbulb },
      ],
    },
    ...(canCreate
      ? [
          {
            title: "Faculty Contributions",
            items: [
              { label: "Add Resource Person", href: "/resource-persons/new", icon: UserPlus },
              { label: "My Submissions", href: "/resource-persons/my-submissions", icon: FileCheck2 },
            ],
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "Admin Management",
            items: [
              { label: "Approvals Workflow", href: "/admin/approvals", icon: ShieldCheck },
              { label: "Staff Accounts", href: "/admin/users", icon: UserCog },
              { label: "Manage Organisations", href: "/admin/organisations", icon: Building },
              { label: "Manage Expertise", href: "/admin/expertise", icon: Layers },
              { label: "Manage Departments", href: "/admin/departments", icon: GraduationCap },
            ],
          },
        ]
      : []),
  ];

  const roleBadge = user?.role ? getRoleBadgeVariant(user.role) : null;

  return (
    <aside className="w-64 bg-cbit-navy-900 text-white flex flex-col h-full border-r border-cbit-navy-800 shrink-0 select-none">
      {/* Brand & Emblem */}
      <div className="p-5 border-b border-cbit-navy-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-cbit-navy-800 border border-cbit-navy-700 flex items-center justify-center text-cbit-teal-400 font-bold text-xl shadow-inner">
          C
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-base tracking-tight text-white leading-tight">
            CBIT Resource Hub
          </h1>
          <p className="text-[11px] text-cbit-teal-300 font-medium">
            Chaitanya Bharathi Institute
          </p>
        </div>
      </div>

      {/* User Context Card */}
      {user && (
        <div className="px-5 py-4 border-b border-cbit-navy-800/80 bg-cbit-navy-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cbit-teal-600/30 text-cbit-teal-300 border border-cbit-teal-500/30 flex items-center justify-center font-semibold text-xs">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              {roleBadge && (
                <span
                  className={cn(
                    "inline-block px-1.5 py-0.2 rounded text-[10px] font-medium mt-0.5",
                    roleBadge.bg,
                    roleBadge.text
                  )}
                >
                  {roleBadge.label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.title} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-cbit-navy-400">
              {group.title}
            </h2>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-cbit-teal-600 text-white shadow-sm"
                        : "text-cbit-navy-200 hover:bg-cbit-navy-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-cbit-navy-800">
        <button
          onClick={() => logout()}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

