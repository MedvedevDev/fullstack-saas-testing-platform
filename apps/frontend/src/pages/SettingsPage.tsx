import React, { useState, useEffect } from "react";
import { Save, Lock, User, Loader2, Sun, Moon } from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../contexts/ThemeContext";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Profile State
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Fetch current user data
    api.get("/users/me").then((res) => {
      setProfile({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email,
      });
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    try {
      // Create payload: only include password if it's set
      const payload: any = {
        firstName: profile.firstName,
        lastName: profile.lastName,
      };

      if (passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          alert("Passwords do not match!");
          setLoading(false);
          return;
        }
        if (passwords.newPassword.length < 6) {
          alert("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        payload.password = passwords.newPassword;
      }

      await api.put("/users/me", payload);
      setSuccessMsg("Profile updated successfully!");
      setPasswords({ newPassword: "", confirmPassword: "" }); // Clear password fields
    } catch (err) {
      console.error("Failed to update", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-flow-text-main">
          Account Settings
        </h2>
        <p className="text-sm text-flow-text-muted">
          Manage your profile and security preferences
        </p>
      </div>

      <form
        onSubmit={handleUpdateProfile}
        className="bg-white border border-flow-border rounded-xl p-8 shadow-sm space-y-6"
      >
        {/* Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-flow-blue" />
            <h3 className="font-bold text-flow-text-main">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                First Name
              </label>
              <input
                required
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-flow-blue/20 outline-none transition-all"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                Last Name
              </label>
              <input
                required
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-flow-blue/20 outline-none transition-all"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
              Email Address
            </label>
            <input
              disabled
              className="w-full p-2.5 border border-flow-border rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              value={profile.email}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Email address cannot be changed.
            </p>
          </div>
        </div>

        <div className="border-t border-flow-border my-6"></div>

        {/* Appearance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-flow-blue" />
            <h3 className="font-bold text-flow-text-main">Appearance</h3>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-flow-border p-4">
            <div>
              <h4 className="font-semibold text-flow-text-main">
                Interface Theme
              </h4>
              <p className="text-xs text-flow-text-muted">
                Select or toggle your preferred interface theme.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-flow-border hover:bg-gray-50 active:scale-95 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-flow-border my-6"></div>

        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-flow-blue" />
            <h3 className="font-bold text-flow-text-main">Change Password</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm focus:ring-2 focus:ring-flow-blue/20 outline-none"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-flow-text-muted uppercase mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full p-2.5 border border-flow-border rounded-lg text-sm focus:ring-2 focus:ring-flow-blue/20 outline-none"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-between">
          {successMsg ? (
            <span className="text-green-600 text-sm font-bold animate-in fade-in">
              {successMsg}
            </span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-flow-blue text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
