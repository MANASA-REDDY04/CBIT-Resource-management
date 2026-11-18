"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, AlertCircle, Building } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }
    if (!password) {
      setFormError("Password is required.");
      return;
    }

    const success = await login(email.trim(), password);
    if (success) {
      router.push("/dashboard");
    }
  };

  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setFormError("");
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cbit-navy-950 via-cbit-navy-900 to-cbit-navy-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem / Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-cbit-navy-800 border border-cbit-navy-700 flex items-center justify-center text-cbit-teal-400 font-bold text-3xl shadow-xl">
            C
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          CBIT Resource Hub
        </h1>
        <p className="mt-1 text-center text-sm text-cbit-teal-200">
          Chaitanya Bharathi Institute of Technology (Autonomous)
        </p>
        <p className="text-center text-xs text-cbit-navy-300 mt-0.5">
          Gandipet, Hyderabad, Telangana
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Institutional Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Access the centralized external resource person directory.
            </p>
          </div>

          {(error || formError) && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 flex items-start space-x-2.5 text-sm text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error || formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cbit.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none transition-colors"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-2.5 text-sm font-semibold mt-2"
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick Role Evaluation Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@cbit.ac.in", "Admin@Cbit2025!")}
                className="p-2 text-center rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 transition-colors text-purple-900"
              >
                <div className="text-[11px] font-bold">Admin</div>
                <div className="text-[9px] text-purple-600">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("faculty@cbit.ac.in", "Faculty@Cbit2025!")}
                className="p-2 text-center rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition-colors text-blue-900"
              >
                <div className="text-[11px] font-bold">Faculty</div>
                <div className="text-[9px] text-blue-600">Submissions</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("staff@cbit.ac.in", "Staff@Cbit2025!")}
                className="p-2 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800"
              >
                <div className="text-[11px] font-bold">Staff</div>
                <div className="text-[9px] text-slate-500">Directory Read</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-xs text-cbit-navy-300">
          Protected Institutional System • Single Sign-On / Role-Based Access Control
        </p>
      </div>
    </div>
  );
}

