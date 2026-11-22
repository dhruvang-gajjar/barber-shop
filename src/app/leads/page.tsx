"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  RotateCw,
  MessageSquare,
  Clock,
  IndianRupee,
  Briefcase,
  Target,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building,
} from "lucide-react";
import type { Lead } from "@/types";
import { fetchLeads, updateLead } from "@/lib/api";
import { formatRelativeTime, formatPhoneNumber, cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<Lead["status"]> = ["new", "contacted", "qualified", "closed"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeadsData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchLeads();
    setLeads(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLeadsData();
  }, [loadLeadsData]);

  const handleStatusChange = async (id: string, newStatus: Lead["status"]) => {
    setUpdatingId(id);
    const res = await updateLead(id, newStatus);
    if (res.success) {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
      );
    }
    setUpdatingId(null);
  };

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (serviceFilter !== "all" && l.service !== serviceFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.customer_name?.toLowerCase().includes(q);
      const matchPhone = l.phone_number?.includes(q);
      const matchGoal = l.goal?.toLowerCase().includes(q);
      const matchService = l.service?.toLowerCase().includes(q);
      return matchName || matchPhone || matchGoal || matchService;
    }
    return true;
  });

  // KPI Metrics
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === "new").length;
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const qualifiedCount = leads.filter((l) => l.status === "qualified").length;

  return (
    <div className="h-full overflow-y-auto bg-[#F0F2F5] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-700" />
              WhatsApp Customer Leads Board
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Qualified customer inquiries gathered automatically via WhatsApp AI flows
            </p>
          </div>

          <button
            onClick={loadLeadsData}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium shadow-2xs transition"
          >
            <RotateCw className={cn("w-4 h-4", isLoading && "animate-spin text-emerald-600")} />
            <span>Refresh Leads</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Inquiries
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                New Action Required
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{newCount}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 shadow-2xs">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Contacted
            </p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{contactedCount}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-200 bg-gradient-to-br from-white to-purple-50/40 shadow-2xs">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Qualified / Ready
            </p>
            <p className="text-2xl font-bold text-purple-900 mt-1">{qualifiedCount}</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer name, phone, service, or goal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-full md:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="w-full md:w-auto">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-full md:w-auto"
            >
              <option value="all">All Services</option>
              <option value="mutual_funds">Mutual Funds / SIP</option>
              <option value="insurance">Insurance</option>
              <option value="loans">Loans</option>
              <option value="tax_planning">Tax Saving</option>
              <option value="general_advisory">General Advisory</option>
            </select>
          </div>
        </div>

        {/* Leads Table / Grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {isLoading && leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Loading lead inquiries...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-medium text-gray-700">No leads found</p>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery || statusFilter !== "all" || serviceFilter !== "all"
                  ? "Try clearing filters to see all inquiries."
                  : "When customers text your WhatsApp Business bot and qualify for advisory services, their details will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Amount / Budget</th>
                    <th className="py-3 px-4">Goal / Horizon</th>
                    <th className="py-3 px-4">Callback Window</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredLeads.map((lead) => {
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50/80 transition select-text"
                      >
                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">
                            {lead.customer_name || "Prospect"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {formatPhoneNumber(lead.phone_number)}
                          </div>
                        </td>

                        {/* Service */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            {lead.service?.replace(/_/g, " ").toUpperCase()}
                          </span>
                          {lead.sub_service && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {lead.sub_service}
                            </p>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center text-gray-800 font-medium">
                            <IndianRupee className="w-3.5 h-3.5 text-gray-400 mr-0.5" />
                            <span>{lead.amount || "Not specified"}</span>
                          </div>
                        </td>

                        {/* Goal / Horizon */}
                        <td className="py-3.5 px-4">
                          <div className="text-gray-900 font-medium">
                            {lead.goal || "General Growth"}
                          </div>
                          {lead.time_horizon && (
                            <div className="text-[11px] text-gray-500">
                              Horizon: {lead.time_horizon}
                            </div>
                          )}
                        </td>

                        {/* Callback Time */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center text-xs text-gray-700">
                            <Clock className="w-3.5 h-3.5 text-gray-400 mr-1 flex-shrink-0" />
                            <span>{lead.callback_time || "Anytime"}</span>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) =>
                              handleStatusChange(
                                lead.id,
                                e.target.value as Lead["status"]
                              )
                            }
                            className={cn(
                              "text-xs font-semibold rounded-md px-2 py-1 border transition focus:outline-none",
                              lead.status === "new" &&
                                "bg-amber-50 text-amber-800 border-amber-300",
                              lead.status === "contacted" &&
                                "bg-blue-50 text-blue-800 border-blue-300",
                              lead.status === "qualified" &&
                                "bg-purple-50 text-purple-800 border-purple-300",
                              lead.status === "closed" &&
                                "bg-gray-100 text-gray-700 border-gray-300"
                            )}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                          {formatRelativeTime(lead.created_at)}
                        </td>

                        {/* Direct Action */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/?phone=${encodeURIComponent(lead.phone_number)}`}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#00A884] hover:bg-[#008f6f] text-white rounded-md text-xs font-medium shadow-2xs transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open Chat</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
