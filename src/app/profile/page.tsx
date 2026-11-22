"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGetUsers, apiRegister } from "@/lib/api";
import type { User } from "@/types";
import {
  User as UserIcon,
  Shield,
  KeyRound,
  Users,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function ProfilePage() {
  const { user, token, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "team">("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Team Members State (Admin only)
  const [team, setTeam] = useState<User[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [showAddAdvisorModal, setShowAddAdvisorModal] = useState(false);
  const [newAdvName, setNewAdvName] = useState("");
  const [newAdvEmail, setNewAdvEmail] = useState("");
  const [newAdvPassword, setNewAdvPassword] = useState("");
  const [newAdvRole, setNewAdvRole] = useState<"advisor" | "admin">("advisor");
  const [newAdvPhone, setNewAdvPhone] = useState("");
  const [addAdvLoading, setAddAdvLoading] = useState(false);
  const [addAdvError, setAddAdvError] = useState<string | null>(null);
  const [addAdvSuccess, setAddAdvSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
  }, [user]);

  // Load team members if user is admin and visits team tab
  useEffect(() => {
    if (activeTab === "team" && token && user?.role === "admin") {
      setTeamLoading(true);
      apiGetUsers(token).then((res) => {
        if (res.success && res.users) {
          setTeam(res.users);
        }
        setTeamLoading(false);
      });
    }
  }, [activeTab, token, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    const res = await updateProfile({ name, phone });
    setProfileLoading(false);

    if (res.success) {
      setProfileSuccess("Profile details updated successfully!");
      setTimeout(() => setProfileSuccess(null), 4000);
    } else {
      setProfileError(res.error || "Failed to update profile.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    const res = await updateProfile({ currentPassword, newPassword });
    setPasswordLoading(false);

    if (res.success) {
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } else {
      setPasswordError(res.error || "Failed to change password.");
    }
  };

  const handleCreateAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdvError(null);
    setAddAdvSuccess(null);
    setAddAdvLoading(true);

    const res = await apiRegister({
      name: newAdvName,
      email: newAdvEmail,
      password: newAdvPassword,
      role: newAdvRole,
      phone: newAdvPhone,
    });

    setAddAdvLoading(false);
    if (res.success && res.user) {
      setAddAdvSuccess("Advisor added successfully!");
      setTeam((prev) => [...prev, res.user!]);
      setNewAdvName("");
      setNewAdvEmail("");
      setNewAdvPassword("");
      setNewAdvPhone("");
      setTimeout(() => {
        setShowAddAdvisorModal(false);
        setAddAdvSuccess(null);
      }, 1500);
    } else {
      setAddAdvError(res.error || "Failed to add advisor.");
    }
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const memberSince = user.created_at
    ? new Date(user.created_at * 1000).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="h-full overflow-y-auto bg-[#F0F2F5] p-4 md:p-6 lg:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-wa-darkGreen" />
              Advisor Profile &amp; Settings
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Manage your personal credentials, security keys, and advisory team settings.
            </p>
          </div>

          <button
            onClick={logout}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-medium shadow-2xs transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Card Banner */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-wa-darkGreen text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0 border border-emerald-400/30">
            {initials}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 capitalize">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {user.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  +{user.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-gray-200 space-x-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition ${
              activeTab === "profile"
                ? "border-wa-darkGreen text-wa-darkGreen"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Personal Details</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition ${
              activeTab === "security"
                ? "border-wa-darkGreen text-wa-darkGreen"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security &amp; Password</span>
          </button>

          {user.role === "admin" && (
            <button
              onClick={() => setActiveTab("team")}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition ${
                activeTab === "team"
                  ? "border-wa-darkGreen text-wa-darkGreen"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team Directory</span>
            </button>
          )}
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your display name and contact telephone for advisor communications.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Assigned Platform Role
                </label>
                <input
                  type="text"
                  disabled
                  value={user.role.toUpperCase()}
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 font-semibold cursor-not-allowed capitalize"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 bg-wa-darkGreen hover:bg-[#008069] active:bg-[#006A57] text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Change Password</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Protect your account by setting a strong, cryptographically hashed PBKDF2 password.
              </p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-wa-darkGreen hover:bg-[#008069] active:bg-[#006A57] text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Team Directory (Admin only) */}
        {activeTab === "team" && user.role === "admin" && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Advisor Team Directory</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage registered advisors and platform staff who have access to live WhatsApp chats.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAdvisorModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-wa-darkGreen hover:bg-[#008069] text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Advisor</span>
              </button>
            </div>

            {teamLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading team members...</div>
            ) : team.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No team members registered yet.</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Advisor</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {team.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{m.name}</p>
                            <p className="text-xs text-gray-400">{m.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              m.role === "admin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{m.phone ? `+${m.phone}` : "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatRelativeTime(m.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: Add Advisor */}
        {showAddAdvisorModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Register New Advisor</h3>
                </div>
                <button
                  onClick={() => setShowAddAdvisorModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              {addAdvError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {addAdvError}
                </div>
              )}

              {addAdvSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                  {addAdvSuccess}
                </div>
              )}

              <form onSubmit={handleCreateAdvisor} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Advisor Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={newAdvName}
                    onChange={(e) => setNewAdvName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@sarthi.com"
                    value={newAdvEmail}
                    onChange={(e) => setNewAdvEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newAdvPassword}
                    onChange={(e) => setNewAdvPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={newAdvRole}
                    onChange={(e) => setNewAdvRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="advisor">Financial Advisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="919876543210"
                    value={newAdvPhone}
                    onChange={(e) => setNewAdvPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAdvisorModal(false)}
                    className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addAdvLoading}
                    className="px-4 py-1.5 bg-wa-darkGreen hover:bg-[#008069] text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {addAdvLoading ? "Creating..." : "Add to Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
