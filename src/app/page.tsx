"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  User,
  Users,
  Phone,
  CheckCircle2,
  Calendar,
  Plus,
  RefreshCw,
  DollarSign,
  AlertCircle,
  X,
  MessageSquare,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchSalonAppointments,
  fetchSalonServices,
  createSalonAppointment,
  updateSalonAppointment,
} from "@/lib/api";
import type { Lead, SalonService, SalonCategory, SalonQueueResponse } from "@/types";

function QueueDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  // State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (dateParam) return dateParam;
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  });

  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [queueData, setQueueData] = useState<SalonQueueResponse>({
    success: true,
    date: selectedDate,
    counts: { pending: 0, completed: 0, total: 0 },
    pending: [],
    completed: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Catalog
  const [servicesCatalog, setServicesCatalog] = useState<SalonService[]>([]);
  const [categoriesCatalog, setCategoriesCatalog] = useState<SalonCategory[]>([]);

  // Modals
  const [editingAppointment, setEditingAppointment] = useState<Lead | null>(null);
  const [selectedServiceTitles, setSelectedServiceTitles] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinDate, setWalkinDate] = useState(selectedDate);
  const [walkinTime, setWalkinTime] = useState("10:00 AM");
  const [walkinServices, setWalkinServices] = useState<string[]>([
    "Signature Men's Haircut",
  ]);
  const [walkinNotes, setWalkinNotes] = useState("");
  const [isSubmittingWalkin, setIsSubmittingWalkin] = useState(false);
  const [walkinError, setWalkinError] = useState<string | null>(null);

  // Sync date from URL param if changed externally
  useEffect(() => {
    if (dateParam && dateParam !== selectedDate) {
      setSelectedDate(dateParam);
    }
  }, [dateParam, selectedDate]);

  // Load catalog once
  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchSalonServices();
      if (data.success) {
        setServicesCatalog(data.services);
        setCategoriesCatalog(data.categories);
      }
    }
    loadCatalog();
  }, []);

  // Load appointments for selected date
  const loadAppointments = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);
      const res = await fetchSalonAppointments(selectedDate);
      if (res.success) {
        setQueueData(res);
      }
      setIsLoading(false);
      setIsRefreshing(false);
    },
    [selectedDate]
  );

  useEffect(() => {
    loadAppointments(true);
  }, [loadAppointments]);

  // Auto-poll queue every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      loadAppointments(false);
    }, 20000);
    return () => clearInterval(timer);
  }, [loadAppointments]);

  // Date Navigator Helpers
  const changeDateBy = (days: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const newDateStr = new Intl.DateTimeFormat("en-CA").format(date);
    setSelectedDate(newDateStr);
    router.push(`/?date=${newDateStr}`);
  };

  const jumpToToday = () => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    setSelectedDate(today);
    router.push("/");
  };

  const formattedDateLabel = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Estimated revenue calculation
  const totalEstimatedRevenue = useMemo(() => {
    const all = [...queueData.pending, ...queueData.completed];
    return all.reduce((sum, item) => {
      const raw = (item.amount || "").replace(/[^0-9]/g, "");
      const val = parseInt(raw, 10) || 0;
      return sum + val;
    }, 0);
  }, [queueData]);

  // Handle Mark Done (Complete)
  const handleMarkComplete = async (apt: Lead) => {
    setQueueData((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        pending: Math.max(0, prev.counts.pending - 1),
        completed: prev.counts.completed + 1,
      },
      pending: prev.pending.filter((p) => p.id !== apt.id),
      completed: [{ ...apt, status: "completed" }, ...prev.completed],
    }));

    await updateSalonAppointment(apt.id, { status: "completed" });
    loadAppointments(false);
  };

  // Handle Re-opening completed appointment
  const handleReopen = async (apt: Lead) => {
    setQueueData((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        completed: Math.max(0, prev.counts.completed - 1),
        pending: prev.counts.pending + 1,
      },
      completed: prev.completed.filter((c) => c.id !== apt.id),
      pending: [...prev.pending, { ...apt, status: "new" }],
    }));

    await updateSalonAppointment(apt.id, { status: "new" });
    loadAppointments(false);
  };

  // Open Edit Services Modal
  const openEditModal = (apt: Lead) => {
    setEditingAppointment(apt);
    const existingServices = (apt.sub_service || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setSelectedServiceTitles(existingServices);
    setEditNotes(apt.summary || "");
  };

  // Computed edited total
  const editedPriceTotal = useMemo(() => {
    if (!servicesCatalog.length) return 0;
    return selectedServiceTitles.reduce((sum, title) => {
      const clean = title.toLowerCase().replace(/\s*\(₹\d+\)/, "");
      const match = servicesCatalog.find(
        (s) =>
          s.title.toLowerCase() === title.toLowerCase() ||
          s.title.toLowerCase().replace(/\s*\(₹\d+\)/, "") === clean ||
          s.title.toLowerCase().includes(clean)
      );
      return sum + (match ? match.price : 200);
    }, 0);
  }, [selectedServiceTitles, servicesCatalog]);

  // Save Service Modifications
  const handleSaveEdit = async () => {
    if (!editingAppointment) return;
    setIsSavingEdit(true);

    const updatedAmount = `₹${editedPriceTotal}`;
    const updatedServices = selectedServiceTitles;

    const res = await updateSalonAppointment(editingAppointment.id, {
      services: updatedServices,
      amount: updatedAmount,
      notes: editNotes,
    });

    if (res.success) {
      setEditingAppointment(null);
      loadAppointments(false);
    }
    setIsSavingEdit(false);
  };

  // Submit Add Walk-in
  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinError(null);

    if (!walkinName.trim() || !walkinPhone.trim()) {
      setWalkinError("Customer name and phone number are required.");
      return;
    }

    if (walkinServices.length === 0) {
      setWalkinError("Please select at least one service.");
      return;
    }

    setIsSubmittingWalkin(true);

    const sum = walkinServices.reduce((acc, name) => {
      const clean = name.toLowerCase().replace(/\s*\(₹\d+\)/, "");
      const item = servicesCatalog.find(
        (s) =>
          s.title.toLowerCase() === name.toLowerCase() ||
          s.title.toLowerCase().replace(/\s*\(₹\d+\)/, "") === clean
      );
      return acc + (item ? item.price : 200);
    }, 0);

    const res = await createSalonAppointment({
      customer_name: walkinName.trim(),
      phone_number: walkinPhone.trim(),
      date: walkinDate,
      time: walkinTime,
      services: walkinServices,
      amount: `₹${sum}`,
      notes: walkinNotes.trim() || "Walk-in client",
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setWalkinName("");
      setWalkinPhone("");
      setWalkinNotes("");
      setWalkinServices(["Signature Men's Haircut"]);
      loadAppointments(false);
    } else {
      setWalkinError(res.error || "Failed to add walk-in appointment.");
    }

    setIsSubmittingWalkin(false);
  };

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Top Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            First come, first serve appointments for today.
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Navigation */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1.5 px-2.5 text-xs font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{formattedDateLabel}</span>
            </div>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl shadow-xs transition"
          >
            Today
          </button>

          <button
            onClick={() => loadAppointments(true)}
            disabled={isRefreshing}
            className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl shadow-xs transition"
            title="Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-600" : ""}`}
            />
          </button>

          {/* Add Walk-in Button with Luxury Amber Gradient */}
          <button
            onClick={() => {
              setWalkinDate(selectedDate);
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-medium text-xs rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Walk-in</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid with Sophisticated Ambient Gradients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Waiting Queue */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-white border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Waiting
            </span>
            <div className="p-1.5 bg-amber-100/70 rounded-lg">
              <Users className="w-3.5 h-3.5 text-amber-700" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {queueData.counts.pending}
            </span>
            <span className="text-xs text-slate-500 font-medium">clients</span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed
            </span>
            <div className="p-1.5 bg-emerald-100/70 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {queueData.counts.completed}
            </span>
            <span className="text-xs text-slate-500 font-medium">served</span>
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-white border border-blue-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-800/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Revenue
            </span>
            <div className="p-1.5 bg-blue-100/70 rounded-lg">
              <DollarSign className="w-3.5 h-3.5 text-blue-700" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{totalEstimatedRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Next In Line */}
        <div className="bg-gradient-to-br from-purple-50/80 via-white to-white border border-purple-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-purple-800/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Next Up
            </span>
            <div className="p-1.5 bg-purple-100/70 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-purple-700" />
            </div>
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {queueData.pending[0]?.customer_name || "No pending clients"}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {queueData.pending[0]?.callback_time?.split(" at ")[1] || "Available"}
            </p>
          </div>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center space-x-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === "pending"
              ? "border-slate-900 text-slate-900 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Waiting Queue</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "pending"
                ? "bg-slate-900 text-white font-bold shadow-2xs"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {queueData.counts.pending}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center space-x-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === "completed"
              ? "border-slate-900 text-slate-900 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Completed Appointments</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "completed"
                ? "bg-slate-900 text-white font-bold shadow-2xs"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {queueData.counts.completed}
          </span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                <div className="space-y-1.5">
                  <div className="w-32 h-3.5 bg-slate-100 rounded"></div>
                  <div className="w-20 h-2.5 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="w-20 h-7 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : activeTab === "pending" ? (
        /* PENDING QUEUE (FIRST COME, FIRST SERVE) */
        queueData.pending.length === 0 ? (
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              No Pending Clients
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              The waiting queue is clear for {formattedDateLabel}.
            </p>
            <button
              onClick={() => {
                setWalkinDate(selectedDate);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Walk-in</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {queueData.pending.map((apt, index) => {
              const queueNumber = index + 1;
              const isFirst = queueNumber === 1;
              const timeSlot =
                apt.callback_time?.split(" at ")[1] || "Queued";
              const services = (apt.sub_service || "Haircut")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

              return (
                <div
                  key={apt.id}
                  className={`rounded-2xl p-4 transition shadow-xs ${
                    isFirst
                      ? "bg-gradient-to-r from-amber-50/50 via-white to-white border border-amber-300/80 ring-1 ring-amber-400/30"
                      : "bg-white border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Queue Number & Guest Details */}
                    <div className="flex items-start sm:items-center space-x-3.5">
                      {/* Queue Number Badge */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs ${
                          isFirst
                            ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white border border-amber-600 shadow-xs"
                            : "bg-slate-100 border border-slate-200 text-slate-800"
                        }`}
                      >
                        #{queueNumber}
                      </div>

                      {/* Guest Info */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {apt.customer_name || "Client"}
                          </h4>
                          {isFirst && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Next Up
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          {/* Time */}
                          <div className="flex items-center space-x-1 text-slate-700 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{timeSlot}</span>
                          </div>

                          {/* Phone & Chat Link */}
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a
                              href={`tel:${apt.phone_number}`}
                              className="hover:text-slate-900 hover:underline transition"
                            >
                              {apt.phone_number}
                            </a>
                            <Link
                              href={`/chat?phone=${encodeURIComponent(apt.phone_number)}`}
                              className="ml-1.5 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1 transition"
                              title="Open WhatsApp Chat"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>Chat</span>
                            </Link>
                          </div>
                        </div>

                        {/* Services Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {services.map((svc, sIdx) => (
                            <span
                              key={sIdx}
                              className="bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                            >
                              {svc}
                            </span>
                          ))}
                          <span className="text-xs font-bold text-slate-900 ml-1">
                            {apt.amount || "₹200"}
                          </span>
                        </div>

                        {/* Notes if present */}
                        {apt.summary && (
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            Note: {apt.summary.replace(/WhatsApp Flow Salon Booking:.*?Notes:\s*/, "")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(apt)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 shadow-xs transition cursor-pointer"
                      >
                        Modify Services
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkComplete(apt)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-medium text-xs flex items-center space-x-1.5 shadow-xs transition active:scale-[0.98] cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* COMPLETED APPOINTMENTS LIST */
        queueData.completed.length === 0 ? (
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              No Completed Appointments Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Completed appointments for {formattedDateLabel} will be listed here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {queueData.completed.map((apt) => {
              const services = (apt.sub_service || "Haircut")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

              return (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {apt.customer_name || "Client"}
                        </h4>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                          Completed
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-0.5">
                        <span>{apt.callback_time}</span>
                        <span>•</span>
                        <span>{apt.phone_number}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {services.map((svc, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-900">
                      {apt.amount || "₹200"}
                    </span>
                    <button
                      onClick={() => handleReopen(apt)}
                      className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
                      title="Move back to waiting queue"
                    >
                      Re-open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ================================================================= */}
      {/* SERVICE MODIFIER MODAL                                             */}
      {/* ================================================================= */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">
                  Modify Services
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client: {editingAppointment.customer_name} ({editingAppointment.callback_time})
                </p>
              </div>
              <button
                onClick={() => setEditingAppointment(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Service Checkboxes List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {categoriesCatalog.map((cat) => {
                const catServices = servicesCatalog.filter(
                  (s) => s.categoryId === cat.id
                );
                if (catServices.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {cat.title.replace(/[^\x00-\x7F]/g, "").trim()}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catServices.map((svc) => {
                        const cleanSvcTitle = svc.title.replace(/\s*\(₹\d+\)/, "").trim();
                        const isChecked = selectedServiceTitles.some((t) => {
                          const cleanA = t.toLowerCase().replace(/\s*\(₹\d+\)/, "").trim();
                          const cleanB = cleanSvcTitle.toLowerCase();
                          return cleanA === cleanB || t === svc.title;
                        });

                        return (
                          <label
                            key={svc.id}
                            className={`flex items-start space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                              isChecked
                                ? "bg-amber-50/70 border-amber-300 text-slate-900 ring-1 ring-amber-400/20"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedServiceTitles((prev) => [
                                    ...prev,
                                    cleanSvcTitle,
                                  ]);
                                } else {
                                  setSelectedServiceTitles((prev) =>
                                    prev.filter(
                                      (t) =>
                                        t.toLowerCase().replace(/\s*\(₹\d+\)/, "").trim() !==
                                        cleanSvcTitle.toLowerCase()
                                    )
                                  );
                                }
                              }}
                              className="mt-0.5 accent-amber-600 rounded"
                            />
                            <div className="leading-tight flex-1">
                              <p className="text-xs font-medium text-slate-900">
                                {cleanSvcTitle}
                              </p>
                              <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                                ₹{svc.price}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Notes */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Stylist Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Additional requests or specifications"
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Modal Footer with Live Recalculated Total */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">
                  Total Bill
                </p>
                <p className="text-lg font-bold text-slate-900">
                  ₹{editedPriceTotal.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || selectedServiceTitles.length === 0}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs transition disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ADD WALK-IN GUEST MODAL                                            */}
      {/* ================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">
                  Add Walk-in
                </h3>
                <p className="text-xs text-slate-500">
                  Adds client directly to today's queue.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateWalkin} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {walkinError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>{walkinError}</span>
                </div>
              )}

              {/* Guest Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    required
                    value={walkinDate}
                    onChange={(e) => setWalkinDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={walkinTime}
                    onChange={(e) => setWalkinTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts} className="bg-white">
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Select Services *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-slate-50/70 rounded-xl border border-slate-200">
                  {servicesCatalog.map((svc) => {
                    const cleanTitle = svc.title.replace(/\s*\(₹\d+\)/, "").trim();
                    const isSelected = walkinServices.includes(cleanTitle);

                    return (
                      <label
                        key={svc.id}
                        className={`flex items-start space-x-2 p-2 rounded-lg cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-amber-50/80 border border-amber-300 text-slate-900 ring-1 ring-amber-400/20"
                            : "bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWalkinServices((prev) => [...prev, cleanTitle]);
                            } else {
                              setWalkinServices((prev) =>
                                prev.filter((s) => s !== cleanTitle)
                              );
                            }
                          }}
                          className="mt-0.5 accent-amber-600 rounded"
                        />
                        <div className="leading-tight flex-1">
                          <p className="text-xs font-medium text-slate-900">{cleanTitle}</p>
                          <p className="text-[10px] text-amber-700 font-bold">₹{svc.price}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Notes / Requests
                </label>
                <input
                  type="text"
                  value={walkinNotes}
                  onChange={(e) => setWalkinNotes(e.target.value)}
                  placeholder="Requests or specifications"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Total
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    ₹
                    {walkinServices
                      .reduce((sum, name) => {
                        const clean = name.toLowerCase().replace(/\s*\(₹\d+\)/, "").trim();
                        const item = servicesCatalog.find(
                          (s) =>
                            s.title.toLowerCase() === name.toLowerCase() ||
                            s.title.toLowerCase().replace(/\s*\(₹\d+\)/, "").trim() === clean
                        );
                        return sum + (item ? item.price : 200);
                      }, 0)
                      .toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWalkin}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs transition disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {isSubmittingWalkin ? "Adding..." : "Add to Queue"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading queue...</div>}>
      <QueueDashboard />
    </Suspense>
  );
}
