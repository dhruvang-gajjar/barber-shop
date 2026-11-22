"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Gift,
  RotateCw,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  MessageSquare,
  Layers,
} from "lucide-react";
import type { BillingStats } from "@/types";
import { fetchBillingStats, fetchMetaAnalytics } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function UsagePage() {
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metaLiveLoading, setMetaLiveLoading] = useState(false);
  const [metaLiveData, setMetaLiveData] = useState<any>(null);

  // Fetch only on-demand when visiting this page
  const loadStats = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchBillingStats();
    setStats(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSyncMeta = async () => {
    setMetaLiveLoading(true);
    const data = await fetchMetaAnalytics();
    setMetaLiveData(data);
    setMetaLiveLoading(false);
  };

  const freeMessages = stats?.free_messages ?? 0;
  const chargeableMessages = stats?.chargeable_messages ?? 0;
  const totalMessages = stats?.total_messages ?? 0;
  const freeConvsUsed = stats?.free_conversations_used ?? 0;
  const freeLimit = stats?.free_conversations_limit ?? 1000;
  const freeConvsRemaining = stats?.free_conversations_remaining ?? 1000;
  const monthName = stats?.month ?? "This Month";

  const freePercentage = Math.min(
    100,
    Math.round((freeConvsUsed / Math.max(freeLimit, 1)) * 100)
  );

  return (
    <div className="h-full overflow-y-auto bg-[#F0F2F5] p-4 md:p-6 lg:p-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-wa-darkGreen" />
              WhatsApp Message Usage &amp; Analytics
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Live breakdown of customer message volume and conversation tiers for{" "}
              <span className="font-semibold text-gray-800">{monthName}</span>
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium shadow-2xs transition"
          >
            <RotateCw className={cn("w-4 h-4", isLoading && "animate-spin text-emerald-600")} />
            <span>Refresh Usage</span>
          </button>
        </div>

        {/* 4 Primary KPI Cards (Pure Usage - No Prices) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Messages */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Processed
              </span>
              <span className="p-1.5 bg-gray-100 text-gray-700 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isLoading ? "..." : totalMessages.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">
              All Inbound &amp; Outbound Messages
            </p>
          </div>

          {/* Free Tier Messages */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Free Quota Messages
              </span>
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-emerald-900 mt-2">
              {isLoading ? "..." : freeMessages.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Inbound Inquiries &amp; Service Tier
            </p>
          </div>

          {/* Chargeable / Template Messages */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-gradient-to-br from-white to-amber-50/40 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Broadcast / Templates
              </span>
              <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <Zap className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-amber-900 mt-2">
              {isLoading ? "..." : chargeableMessages.toLocaleString()}
            </p>
            <p className="text-xs text-amber-700 font-medium mt-1">
              Marketing &amp; Utility Broadcasts
            </p>
          </div>

          {/* Monthly Service Conversations Allowance */}
          <div className="bg-white rounded-2xl p-5 border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Monthly 1,000 Tier
              </span>
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Gift className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {isLoading ? "..." : `${freeConvsUsed} / ${freeLimit}`}
            </p>
            <div className="w-full bg-blue-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(freePercentage, 3)}%` }}
              />
            </div>
            <p className="text-xs text-blue-700 font-medium mt-1">
              {freeConvsRemaining} conversations remaining
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inbound Customer Messages */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-emerald-700 mb-2">
              <ArrowDownLeft className="w-5 h-5" />
              <h3 className="font-semibold text-gray-900 text-sm">Customer Inbound Messages</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : (stats?.inbound_messages ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Direct inquiries sent by customers to your WhatsApp number.
            </p>
            <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              User-Initiated
            </span>
          </div>

          {/* Outbound Service & Advisor Replies */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-blue-700 mb-2">
              <ArrowUpRight className="w-5 h-5" />
              <h3 className="font-semibold text-gray-900 text-sm">Advisor &amp; Bot Responses</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : ((stats?.outbound_messages ?? 0) - (stats?.outbound_templates ?? 0)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Human advisor replies and automated flow messages sent to active chats.
            </p>
            <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Service Session
            </span>
          </div>

          {/* Outbound Templates */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-amber-700 mb-2">
              <FileText className="w-5 h-5" />
              <h3 className="font-semibold text-gray-900 text-sm">Pre-Approved Templates</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : (stats?.outbound_templates ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Pre-approved outbound marketing and utility notification templates.
            </p>
            <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
              Business-Initiated
            </span>
          </div>
        </div>

        {/* Live Meta Graph API Query Card */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Live Meta Graph API Volume Sync
                </h3>
                <p className="text-xs text-gray-500">
                  Direct query to Meta&apos;s <code>conversation_analytics</code> endpoint for your WABA account
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncMeta}
              disabled={metaLiveLoading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
            >
              <RotateCw className={cn("w-3.5 h-3.5", metaLiveLoading && "animate-spin")} />
              <span>{metaLiveLoading ? "Querying Meta..." : "Sync from Meta"}</span>
            </button>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Meta allows querying official conversation volumes and service session analytics directly from your WhatsApp Business Account (WABA). Click <strong>&quot;Sync from Meta&quot;</strong> to inspect the raw volume data returned by Meta&apos;s servers.
          </p>

          {metaLiveData && (
            <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono max-h-60 overflow-y-auto mt-2">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(metaLiveData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Categories Guide (No Prices) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            WhatsApp Business Message Categories Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="font-semibold text-gray-800 text-xs">1. User-Initiated Service Conversations</h4>
              <ul className="space-y-1.5 list-disc pl-4">
                <li>
                  Triggered when a customer messages your business first.
                </li>
                <li>
                  Opens a 24-hour service window for advisor replies and interactive bot assistance.
                </li>
                <li>
                  Every WhatsApp Business Account receives an initial 1,000 free service conversations each calendar month.
                </li>
              </ul>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="font-semibold text-gray-800 text-xs">2. Business-Initiated Broadcast Templates</h4>
              <ul className="space-y-1.5 list-disc pl-4">
                <li>
                  Triggered when your business reaches out proactively to customers outside the 24-hour window.
                </li>
                <li>
                  Must use pre-approved Meta message templates (Marketing, Utility, or Authentication).
                </li>
                <li>
                  Categorized separately from standard service conversation quotas.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
