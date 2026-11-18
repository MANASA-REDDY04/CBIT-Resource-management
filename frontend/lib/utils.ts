import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null, formatStr: string = "dd MMM yyyy"): string {
  if (!dateString) return "Present";
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd MMM yyyy, hh:mm a");
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case "APPROVED":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Approved",
      };
    case "PENDING":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Pending Review",
      };
    case "REJECTED":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        label: "Rejected",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        label: status,
      };
  }
}

export function getRoleBadgeVariant(role: string): { bg: string; text: string; border: string; label: string } {
  switch (role) {
    case "ADMIN":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        label: "System Admin",
      };
    case "AUTHORISED_FACULTY":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        label: "Authorised Faculty",
      };
    case "GENERAL_STAFF":
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        label: "General Staff",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200",
        label: role,
      };
  }
}

