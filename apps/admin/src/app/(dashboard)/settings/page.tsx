"use client";

import { Bell, Globe, Lock, Save, Store, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const SettingsPage = () => {
  const { user } = useUser();
  const { settings: dbSettings, updateSettings, isUpdating } = useStoreSettings();

  // Local state for form handling
  const [localSettings, setLocalSettings] = useState({
    storeName: "",
    storeLogo: "",
    storeAddress: "", // Added storeAddress
    email: "", // Email is from Clerk user, not stored in DB currently? Plan didn't include email in DB.
    currency: "INR",
    language: "en-IN",
    notifications: true,
    emailAlerts: true,
    lowStockAlert: true,
    orderUpdates: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Sync DB settings to local state when loaded
  useEffect(() => {
    if (dbSettings) {
      setLocalSettings(prev => ({
        ...prev,
        ...dbSettings,
        // Preserve email/notifications which are local/user specific for now
      }));
    } else {
      // Defaults if loading or empty
      setLocalSettings(prev => ({
        ...prev,
        storeName: "Xiaomi India",
        storeLogo: "/logo.png",
        storeAddress: "123 E-Commerce St.\nTech City, TC 90210",
      }))
    }
  }, [dbSettings]);

  // Initialize email from Clerk
  useEffect(() => {
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (email) {
      setLocalSettings(prev => ({ ...prev, email }));
    }
  }, [user]);

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save global settings to DB
      await updateSettings({
        storeName: localSettings.storeName,
        storeLogo: localSettings.storeLogo,
        storeAddress: localSettings.storeAddress,
        currency: localSettings.currency,
        language: localSettings.language
      });
      // Notifications/Email are still local or handled elsewhere? 
      // For now we just respect the requested DB changes.

      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleCancel = () => {
    if (dbSettings) {
      setLocalSettings(prev => ({ ...prev, ...dbSettings }));
    }
    setHasChanges(false);
    toast.info("Changes discarded");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your store preferences and system settings
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              Unsaved changes
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">Store Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={localSettings.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                placeholder="Enter your store name"
                className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Store Logo URL
              </label>
              <div className="flex gap-4 items-center">
                <div className="relative w-12 h-12 bg-white rounded-lg border p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={localSettings.storeLogo || "/mi-logo.png"}
                    alt="Store Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
                  />
                </div>
                <input
                  type="text"
                  value={localSettings.storeLogo || ""}
                  onChange={(e) => handleChange("storeLogo", e.target.value)}
                  placeholder="e.g. /mi-logo.png or https://example.com/logo.png"
                  className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Path to image in /public folder or external URL
              </p>
            </div>

            <div> {/* NEW: Store Address Field */}
              <label className="block text-sm font-medium mb-2">
                Store Address
              </label>
              <textarea
                value={localSettings.storeAddress}
                onChange={(e) => handleChange("storeAddress", e.target.value)}
                placeholder="Enter your store address (appears on invoices)"
                rows={3}
                className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                This address will be displayed on all invoices
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={localSettings.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Used for important notifications and customer support
              </p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold">Regional Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Currency
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Language
              </label>
              <select
                value={localSettings.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">हिंदी (Hindi)</option>
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                key: "notifications",
                label: "Enable All Notifications",
                desc: "Receive all system notifications"
              },
              {
                key: "emailAlerts",
                label: "Email Alerts",
                desc: "Get important updates via email"
              },
              {
                key: "lowStockAlert",
                label: "Low Stock Alerts",
                desc: "Notify when inventory is running low"
              },
              {
                key: "orderUpdates",
                label: "Order Updates",
                desc: "Get notified of new orders and changes"
              },
            ].map((item) => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localSettings[item.key as keyof typeof localSettings] as boolean}
                  onChange={(e) => handleChange(item.key, e.target.checked)}
                  className="mt-0.5 w-5 h-5 text-primary rounded border-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <button
          onClick={handleCancel}
          disabled={!hasChanges || isUpdating}
          className="px-6 py-2.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isUpdating}
          className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
