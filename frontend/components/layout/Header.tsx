"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Menu, ShieldAlert, User as UserIcon, Bell } from "lucide-react";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const getBreadcrumbTitle = () => {
    if (pathname.startsWith("/resource-persons/new")) return "Add Resource Person";
    if (pathname.startsWith("/resource-persons/my-submissions")) return "My Submissions";
    if (pathname.startsWith("/resource-persons")) return "Resource Person Directory";
    if (pathname.startsWith("/organisations")) return "Partner Organisations";
    if (pathname.startsWith("/expertise")) return "Areas of Expertise";
    if (pathname.startsWith("/admin/approvals")) return "Profile Approvals Queue";
    if (pathname.startsWith("/admin/users")) return "Staff Account Management";
    if (pathname.startsWith("/admin/organisations")) return "Organisation Management";
    if (pathname.startsWith("/admin/expertise")) return "Expertise Management";
    if (pathname.startsWith("/admin/departments")) return "Department Management";
    if (pathname.startsWith("/profile")) return "Staff Profile";
    return "Institutional Dashboard";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-semibold text-slate-900 leading-tight">
            {getBreadcrumbTitle()}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            Chaitanya Bharathi Institute of Technology • Resource Person Management
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {user?.role === "ADMIN" && (
          <Link
            href="/admin/approvals"
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Approvals</span>
          </Link>
        )}

        <Link
          href="/profile"
          className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
        >
          <div className="w-7 h-7 rounded-full bg-cbit-navy-800 text-white flex items-center justify-center text-xs font-semibold">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <span className="text-xs font-medium hidden md:inline-block max-w-[120px] truncate">
            {user?.full_name}
          </span>
        </Link>
      </div>
    </header>
  );
};

