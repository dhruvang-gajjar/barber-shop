"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Building2,
  Phone,
  Mail,
  Lock,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { useBusiness } from "@/context/BusinessContext";
import type { BusinessTenant } from "@/types";

interface ClientSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientSetupModal({ isOpen, onClose }: ClientSetupModalProps) {
  const {
    businesses,
    activeBusiness,
    setActiveBusinessId,
    registerBusiness,
    deleteBusiness,
    addWhatsAppNumber,
    removeWhatsAppNumber,
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<"manage" | "create">("manage");

  // Create form state
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [city, setCity] = useState("");
  const [assignedEmail, setAssignedEmail] = useState("");
  const [assignedPassword, setAssignedPassword] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [whatsappNumbers, setWhatsappNumbers] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Per-client number adder state
  const [addingNumberForId, setAddingNumberForId] = useState<string | null>(null);
  const [newNumberValue, setNewNumberValue] = useState("");

  if (!isOpen) return null;

  const handleAddNumberToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneInput.replace(/\D/g, "");
    if (!cleaned) return;
    if (whatsappNumbers.includes(cleaned)) {
      setFormError(`Number ${cleaned} is already added.`);
      return;
    }
    setWhatsappNumbers([...whatsappNumbers, cleaned]);
    setPhoneInput("");
    setFormError("");
  };

  const handleRemoveDraftNumber = (num: string) => {
    setWhatsappNumbers(whatsappNumbers.filter((n) => n !== num));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Business Name is required.");
      return;
    }

    if (whatsappNumbers.length === 0 && !phoneInput.trim()) {
      setFormError("Please configure at least one WhatsApp business number.");
      return;
    }

    const finalNumbers = [...whatsappNumbers];
    if (phoneInput.trim()) {
      const cleaned = phoneInput.replace(/\D/g, "");
      if (cleaned && !finalNumbers.includes(cleaned)) {
        finalNumbers.push(cleaned);
      }
    }

    const created = registerBusiness({
      name: name.trim(),
      tagline: tagline.trim() || "Salon & Barber Lounge",
      city: city.trim() || "India",
      phone: finalNumbers[0] ? `+${finalNumbers[0]}` : "+91 98000 00000",
      whatsappNumbers: finalNumbers,
      assignedEmail: assignedEmail.trim() || undefined,
      assignedPassword: assignedPassword.trim() || undefined,
    });

    setName("");
    setTagline("");
    setCity("");
    setAssignedEmail("");
    setAssignedPassword("");
    setPhoneInput("");
    setWhatsappNumbers([]);
    setFormError("");
    setSuccessMessage(`Successfully configured dashboard for ${created.name}!`);
    setActiveTab("manage");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleInlineAddNumber = (businessId: string) => {
    const cleaned = newNumberValue.replace(/\D/g, "");
    if (!cleaned) return;
    addWhatsAppNumber(businessId, cleaned);
    setNewNumberValue("");
    setAddingNumberForId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-amber-50/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Client Management & WhatsApp Setup</h2>
              <p className="text-xs text-slate-500">
                Configure isolated client dashboards and their dedicated WhatsApp business numbers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("manage")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 ${
                activeTab === "manage"
                  ? "border-amber-600 text-amber-900 bg-amber-50/60"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              All Clients ({businesses.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center space-x-1.5 ${
                activeTab === "create"
                  ? "border-amber-600 text-amber-900 bg-amber-50/60"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Setup New Client</span>
            </button>
          </div>

          {successMessage && (
            <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{successMessage}</span>
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === "manage" ? (
            <div className="space-y-3.5">
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 text-xs text-amber-900 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Strict Client Isolation Rule:</span> When a client logs in,
                  they only have access to their dashboard and will strictly see conversations sent to or received
                  from their configured WhatsApp numbers.
                </div>
              </div>

              {businesses.map((biz) => {
                const isActive = biz.id === activeBusiness.id;
                const numbers = biz.whatsappNumbers || [biz.phone.replace(/\D/g, "")].filter(Boolean);

                return (
                  <div
                    key={biz.id}
                    className={`p-4 rounded-2xl border transition ${
                      isActive
                        ? "border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Business Identity */}
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 mt-0.5">
                          {biz.initials || "BS"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-slate-900 truncate">{biz.name}</h3>
                            {isActive && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                                Active Dashboard
                              </span>
                            )}
                            {biz.isCustom && (
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-blue-200">
                                Custom Client
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {biz.city ? `${biz.city} • ` : ""}
                            {biz.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Switch & Delete Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => setActiveBusinessId(biz.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center space-x-1"
                          >
                            <span>Switch Dashboard</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-amber-700 font-medium flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Viewing</span>
                          </span>
                        )}

                        {biz.isCustom && (
                          <button
                            type="button"
                            onClick={() => deleteBusiness(biz.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp Business Numbers Section */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1">
                          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                          <span>Connected WhatsApp Business Numbers:</span>
                        </span>

                        {addingNumberForId !== biz.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setAddingNumberForId(biz.id);
                              setNewNumberValue("");
                            }}
                            className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Number</span>
                          </button>
                        )}
                      </div>

                      {/* Number Chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {numbers.map((num) => (
                          <span
                            key={num}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            <span className="text-amber-600">WA:</span>
                            <span>{num}</span>
                            {numbers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWhatsAppNumber(biz.id, num)}
                                className="text-slate-400 hover:text-rose-600 ml-1 rounded-full p-0.5 transition cursor-pointer"
                                title="Remove number"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))}

                        {/* Inline Add Input */}
                        {addingNumberForId === biz.id && (
                          <div className="inline-flex items-center space-x-1 bg-amber-50/80 p-1 rounded-xl border border-amber-300">
                            <input
                              type="text"
                              value={newNumberValue}
                              onChange={(e) => setNewNumberValue(e.target.value)}
                              placeholder="e.g. 9601475410"
                              className="px-2 py-0.5 text-xs font-mono bg-white border border-slate-200 rounded-lg outline-none w-32 focus:border-amber-600"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleInlineAddNumber(biz.id);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleInlineAddNumber(biz.id)}
                              className="px-2 py-0.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingNumberForId(null)}
                              className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Client Login Credentials Note */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-slate-700">
                            {biz.assignedEmail || `${biz.id}@thebarbershop.com`}
                          </span>
                        </span>
                        {biz.assignedPassword && (
                          <span className="flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span className="font-mono text-slate-600">Password: {biz.assignedPassword}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 italic">
                        Login locks user to this salon dashboard
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Setup New Client Form */
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Cuts Lounge"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-600 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Branch Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Delhi, Mumbai"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Premium Grooming Studio & Spa"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-600 outline-none transition"
                />
              </div>

              {/* WhatsApp Numbers Config */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                <label className="block text-xs font-bold text-amber-950">
                  Client WhatsApp Business Numbers (1 or more) *
                </label>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter each WhatsApp Business number connected to this client in Meta. Any inbound or outbound
                  messages on these numbers will be strictly restricted to this dashboard only.
                </p>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. 9601475410 or 123"
                    className="flex-1 px-3.5 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:border-amber-600 outline-none transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNumberToDraft(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNumberToDraft}
                    className="px-3.5 py-2 text-xs font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Number</span>
                  </button>
                </div>

                {/* Added Tags */}
                {whatsappNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {whatsappNumbers.map((num) => (
                      <span
                        key={num}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-slate-900 border border-amber-300 shadow-xs"
                      >
                        <span className="text-amber-600 font-semibold">WA:</span>
                        <span>{num}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftNumber(num)}
                          className="text-slate-400 hover:text-rose-600 ml-1 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Login Credentials Setup */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Client Login Credentials (Optional)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Allow your client manager to log in with their own email & password. They will be locked to this
                  dashboard.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Client Email
                    </label>
                    <input
                      type="email"
                      value={assignedEmail}
                      onChange={(e) => setAssignedEmail(e.target.value)}
                      placeholder="e.g. manager@salon.com"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Client Password
                    </label>
                    <input
                      type="text"
                      value={assignedPassword}
                      onChange={(e) => setAssignedPassword(e.target.value)}
                      placeholder="e.g. SalonPass@2026"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("manage")}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Create Client Dashboard & Account</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
