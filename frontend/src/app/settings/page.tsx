"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  User,
  Lock,
  ShieldAlert,
  Save,
  Loader2,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    changePassword,
    deactivateAccount,
    deleteAccount,
  } = useAuth();

  const [name, setName] =
    useState(user?.name || "");

  const [email, setEmail] =
    useState(user?.email || "");

  const [phone, setPhone] =
    useState(user?.phone || "");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [accountPassword, setAccountPassword] =
    useState("");

  if (!user) {
    return null;
  }

  // =====================================
  // PROFILE
  // =====================================

  const handleProfileUpdate =
    async () => {
      setError("");
      setMessage("");
      setSaving(true);

      const result =
        await updateProfile({
          name,
          email,
          phone,
        });

      setSaving(false);

      if (!result.success) {
        setError(
          result.error ||
            "Failed to update profile."
        );
        return;
      }

      setMessage(
        "Profile updated successfully."
      );
    };

  // =====================================
  // PASSWORD
  // =====================================

  const handlePasswordChange =
    async () => {
      setError("");
      setMessage("");

      if (newPassword.length < 8) {
        setError(
          "New password must be at least 8 characters."
        );
        return;
      }

      if (
        newPassword !== confirmPassword
      ) {
        setError(
          "New passwords do not match."
        );
        return;
      }

      setChangingPassword(true);

      const result =
        await changePassword(
          currentPassword,
          newPassword
        );

      setChangingPassword(false);

      if (!result.success) {
        setError(
          result.error ||
            "Failed to change password."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "Password changed successfully."
      );
    };

  // =====================================
  // DEACTIVATE
  // =====================================

  const handleDeactivate =
    async () => {
      if (
        !accountPassword
      ) {
        setError(
          "Please enter your password."
        );
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to deactivate your account?"
        );

      if (!confirmed) {
        return;
      }

      const result =
        await deactivateAccount(
          accountPassword
        );

      if (!result.success) {
        setError(
          result.error ||
            "Failed to deactivate account."
        );
      }
    };

  // =====================================
  // DELETE
  // =====================================

  const handleDelete =
    async () => {
      if (
        !accountPassword
      ) {
        setError(
          "Please enter your password."
        );
        return;
      }

      const confirmed =
        window.confirm(
          "This permanently deletes your account. Continue?"
        );

      if (!confirmed) {
        return;
      }

      const result =
        await deleteAccount(
          accountPassword
        );

      if (!result.success) {
        setError(
          result.error ||
            "Failed to delete account."
        );
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex items-center gap-3">

          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white transition"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>

          <div>
            <h1 className="text-xl font-black text-slate-900">
              Account Settings
            </h1>

            <p className="text-xs text-slate-500">
              Manage your profile and account security.
            </p>
          </div>

        </div>

        {/* MESSAGES */}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {/* PROFILE */}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-2 rounded-xl bg-indigo-50">
              <User className="h-5 w-5 text-indigo-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Profile
              </h2>

              <p className="text-xs text-slate-500">
                Update your personal information.
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />

              {email !== user.email && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Changing your email will require verification again.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Phone
              </label>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="+92..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Role
              </label>

              <input
                value={user.role}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-500"
              />
            </div>

          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={saving}
            className="mt-5 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </section>

        {/* PASSWORD */}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-2 rounded-xl bg-indigo-50">
              <Lock className="h-5 w-5 text-indigo-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Change Password
              </h2>

              <p className="text-xs text-slate-500">
                Update your account password.
              </p>
            </div>

          </div>

          <div className="space-y-4">

            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />

            <button
              onClick={
                handlePasswordChange
              }
              disabled={
                changingPassword
              }
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
            >
              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>

          </div>

        </section>

        {/* DANGER ZONE */}

        <section className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2 rounded-xl bg-rose-50">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
            </div>

            <div>
              <h2 className="font-bold text-rose-700">
                Danger Zone
              </h2>

              <p className="text-xs text-slate-500">
                These actions affect your account access.
              </p>
            </div>

          </div>

          <input
            type="password"
            placeholder="Enter password"
            value={accountPassword}
            onChange={(e) =>
              setAccountPassword(
                e.target.value
              )
            }
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4"
          />

          <div className="flex flex-wrap gap-3">

            <button
              onClick={
                handleDeactivate
              }
              className="px-4 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-sm font-bold hover:bg-amber-50"
            >
              Deactivate Account
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold"
            >
              Delete Account
            </button>

          </div>

        </section>

      </div>
    </div>
  );
}