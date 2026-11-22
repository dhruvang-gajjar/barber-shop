"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Info,
  X,
  RotateCw,
  Gift,
  Coins,
  CheckCircle,
  ExternalLink,
  Activity,
} from "lucide-react";
import type { BillingStats } from "@/types";
import { fetchMetaAnalytics } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BillingStatsWidgetProps {
  stats: BillingStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function BillingStatsWidget({
  stats,
  isLoading,
  onRefresh,
}: BillingStatsWidgetProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [metaLiveLoading, setMetaLiveLoading] = useState(false);
  const [metaLiveData, setMetaLiveData] = useState<any>(null);

  // Defaults if loading or empty
  const freeMessages = stats?.free_messages ?? 0;
  const chargeableMessages = stats?.chargeable_messages ?? 0;
  const freeConvsUsed = stats?.free_conversations_used ?? 0;
  const freeLimit = stats?.free_conversations_limit ?? 1000;
  const freeConvsRemaining = stats?.free_conversations_remaining ?? 1000;
  const estCost = stats?.estimated_cost_inr ?? "₹0.00";
  const monthName = stats?.month ?? "This Month";

  const freePercentage = Math.min(
    100,
    Math.round((freeConvsUsed / Math.max(freeLimit, 1)) * 100)
  );

  const handleFetchMetaLive = async () => {
    setMetaLiveLoading(true);
    const data = await fetchMetaAnalytics();
    setMetaLiveData(data);
    setMetaLiveLoading(false);
  };

  return (
    <>
      <div className="bg-white border-b border-[#E9EDEF] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs select-none">
        {/* Left: Quick Stat Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Free Messages Pill */}
          <div
            title="All customer incoming messages and chatbot replies within the free tier"
            className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-md font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Free Messages:</span>
            <span className="font-bold text-emerald-900 bg-emerald-100/90 px-1.5 py-0.2 rounded">
              {isLoading && !stats ? "..." : freeMessages.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 hidden md:inline font-normal">
              (100% Free)
            </span>
          </div>

          {/* Chargeable Messages Pill */}
          <div
            title="Outbound template marketing/utility messages or billable conversations"
            className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-md font-medium"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Chargeable Messages:</span>
            <span className="font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded">
              {isLoading && !stats ? "..." : chargeableMessages.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-600 hidden md:inline font-normal">
              (Templates)
            </span>
          </div>

          {/* Meta Monthly Free Tier Progress */}
          <div
            title={`Meta grants 1,000 free service conversations each calendar month. ${freeConvsRemaining} remaining.`}
            className="flex items-center space-x-2 bg-blue-50 text-blue-800 border border-blue-200/80 px-2.5 py-1 rounded-md"
          >
            <Gift className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="font-medium hidden sm:inline">Free Tier:</span>
            <span className="font-bold text-blue-900">
              {freeConvsUsed}/{freeLimit}
            </span>
            <div className="w-12 h-1.5 bg-blue-200 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(freePercentage, 4)}%` }}
              />
            </div>
            <span className="text-[10px] text-blue-600 font-normal">
              ({freeConvsRemaining} left)
            </span>
          </div>

          {/* Estimated Cost */}
          <div className="flex items-center space-x-1 bg-purple-50 text-purple-800 border border-purple-200/80 px-2.5 py-1 rounded-md font-medium">
            <Coins className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span>Est. Cost:</span>
            <span className="font-bold text-purple-900 font-mono">{estCost}</span>
          </div>
        </div>

        {/* Right: Info & Refresh Controls */}
        <div className="flex items-center space-x-1.5 ml-auto text-xs">
          <button
            onClick={() => setShowInfoModal(true)}
            className="flex items-center space-x-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 px-2 py-1 rounded transition"
            title="How Meta WhatsApp billing works & query Meta Graph API"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Meta Pricing &amp; Sync</span>
          </button>

          <button
            onClick={onRefresh}
            title="Refresh billing and message stats"
            className={cn(
              "p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded transition",
              isLoading && "animate-spin text-emerald-600"
            )}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pricing Breakdown Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-gray-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    WhatsApp Message &amp; Billing Breakdown
                  </h3>
                  <p className="text-xs text-gray-500">{monthName} Usage</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setMetaLiveData(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 text-xs text-gray-600">
              {/* Stat Summary Box */}
              <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <p className="text-gray-500 font-medium">Free Messages</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {freeMessages.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Inbound + Free Service tier
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Chargeable Messages</p>
                  <p className="text-lg font-bold text-amber-700">
                    {chargeableMessages.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Templates &amp; Paid sessions
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Monthly Free Tier</p>
                  <p className="text-lg font-bold text-blue-700">
                    {freeConvsUsed} / {freeLimit}
                  </p>
                  <p className="text-[10px] text-blue-500">
                    {freeConvsRemaining} conversations remaining
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Estimated Cost</p>
                  <p className="text-lg font-bold text-purple-700 font-mono">
                    {estCost}
                  </p>
                  <p className="text-[10px] text-gray-400">Currency: INR (₹)</p>
                </div>
              </div>

              {/* Direct Meta Graph API Query Section */}
              <div className="bg-emerald-50/60 border border-emerald-200/70 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-emerald-900 text-xs">
                      Live Meta Graph API Query
                    </span>
                  </div>
                  <button
                    onClick={handleFetchMetaLive}
                    disabled={metaLiveLoading}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-medium transition"
                  >
                    <RotateCw
                      className={cn("w-3 h-3", metaLiveLoading && "animate-spin")}
                    />
                    <span>{metaLiveLoading ? "Querying..." : "Sync from Meta"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800/80">
                  Queries Meta&apos;s official <code>conversation_analytics</code> API for your WhatsApp Business Account (WABA).
                </p>

                {metaLiveData && (
                  <div className="bg-white p-2.5 rounded border border-emerald-200 text-[11px] max-h-40 overflow-y-auto font-mono text-gray-800">
                    {metaLiveData.error ? (
                      <p className="text-red-500 font-sans">{metaLiveData.error}</p>
                    ) : (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(
                          metaLiveData.meta_conversations || metaLiveData,
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Explanatory Rules */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  How WhatsApp Business API Pricing Works (Meta India)
                </h4>

                <div className="space-y-1.5 pl-5 list-disc text-gray-600">
                  <p>
                    <strong className="text-gray-800">1. Customer Inbound Messages:</strong>{" "}
                    Always <span className="text-emerald-700 font-semibold">100% Free</span>. Meta never charges when customers text your business.
                  </p>
                  <p>
                    <strong className="text-gray-800">2. 1,000 Free Service Conversations/mo:</strong>{" "}
                    Meta gives every WhatsApp Business Account 1,000 free user-initiated service conversations each calendar month.
                  </p>
                  <p>
                    <strong className="text-gray-800">3. 24-Hour Conversation Window:</strong>{" "}
                    Within an open 24h window, you and your automated bot can send unlimited messages to the customer without extra per-message fees.
                  </p>
                  <p>
                    <strong className="text-gray-800">4. Business-Initiated Templates:</strong>{" "}
                    Proactive outbound messages sent using pre-approved Meta templates (Marketing ~₹0.80, Utility ~₹0.15) initiate chargeable conversations.
                  </p>
                  <p>
                    <strong className="text-gray-800">5. Service Conversations Beyond 1,000:</strong>{" "}
                    Charged at ~₹0.35 per 24-hour conversation window in India.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setMetaLiveData(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
