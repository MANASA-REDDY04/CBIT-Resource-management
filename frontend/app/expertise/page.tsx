"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Expertise } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ExpertiseGridSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  Lightbulb,
  Search,
  Users,
  ExternalLink,
  Layers,
  ChevronRight,
  User,
} from "lucide-react";

export default function ExpertiseDirectoryPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTopicForModal, setActiveTopicForModal] = useState<Expertise | null>(null);

  // 1. Fetch Categories
  const { data: categories } = useQuery<string[]>({
    queryKey: ["expertise-categories"],
    queryFn: async () => {
      const res = await api.get("/expertise/categories");
      return res.data;
    },
  });

  // 2. Fetch Expertise List
  const { data: topics, isLoading } = useQuery<Expertise[]>({
    queryKey: ["expertise-list", search, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedCategory) params.append("category", selectedCategory);
      params.append("limit", "250");
      params.append("is_active", "true");
      const res = await api.get(`/expertise?${params.toString()}`);
      return res.data;
    },
  });

  // 3. Fetch Associated Resource Persons for Modal
  const { data: modalPersons, isLoading: modalLoading } = useQuery<any[]>({
    queryKey: ["expertise-persons", activeTopicForModal?.id],
    queryFn: async () => {
      if (!activeTopicForModal) return [];
      const res = await api.get(`/expertise/${activeTopicForModal.id}/resource-persons`);
      return res.data;
    },
    enabled: Boolean(activeTopicForModal),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Areas of Expertise Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and discover verified external resource persons categorized by research domains and technology skills.
          </p>
        </div>

        {isAdmin && (
          <Link href="/admin/expertise">
            <Button size="md">
              <Layers className="w-4 h-4 mr-1.5" />
              Manage Expertise
            </Button>
          </Link>
        )}
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expertise topics (e.g. Generative AI, VLSI, Cloud)..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-700 focus:border-cbit-navy-800 focus:ring-1 focus:ring-cbit-navy-800 outline-none bg-white"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                selectedCategory === ""
                  ? "bg-cbit-navy-800 text-white border-cbit-navy-800 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  selectedCategory === cat
                    ? "bg-cbit-teal-600 text-white border-cbit-teal-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Topics Grid */}
      {isLoading ? (
        <ExpertiseGridSkeleton count={6} />
      ) : topics && topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{topic.expertise_name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cbit-teal-50 text-cbit-teal-800 border border-cbit-teal-200 shrink-0">
                    {topic.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                  {topic.description || "No topic description provided."}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-cbit-teal-600" />
                  <span>{topic.resource_person_count ?? 0} Mapped Experts</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTopicForModal(topic)}
                  className="text-xs font-semibold text-cbit-navy-800 hover:text-cbit-teal-700 flex items-center transition-colors"
                >
                  View Experts <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-500">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800">No expertise areas found</h3>
          <p className="text-xs text-slate-500 mt-1">Try another search term or filter.</p>
        </div>
      )}

      {/* Modal: View Associated Experts */}
      <Modal
        isOpen={Boolean(activeTopicForModal)}
        onClose={() => setActiveTopicForModal(null)}
        title={activeTopicForModal ? `Experts in ${activeTopicForModal.expertise_name}` : "Experts"}
        description={activeTopicForModal?.category}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {modalLoading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading experts...</p>
          ) : modalPersons && modalPersons.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {modalPersons.map((person) => (
                <div
                  key={person.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-cbit-navy-800 text-white flex items-center justify-center font-bold text-xs">
                      {person.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{person.full_name}</h4>
                      <p className="text-[11px] text-slate-500">{person.designation}</p>
                    </div>
                  </div>

                  <Link
                    href={`/resource-persons/${person.id}`}
                    onClick={() => setActiveTopicForModal(null)}
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">No approved resource persons currently mapped to this topic.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

