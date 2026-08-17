import React, { useEffect, useRef, useState } from "react";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/features/profile/hooks/useProfile.ts";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Input from "@/components/ui/Input.tsx";
import Button from "@/components/ui/Button.tsx";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import { HiOutlineCamera, HiOutlineBadgeCheck } from "react-icons/hi";

export const MyProfilePage: React.FC = () => {
  const { data: profile, isLoading } = useProfileQuery();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();
  const { auth, setAuthData } = useAuthContext();
  const { errorNotificationDashboard } = useNotificationContext();
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    role: string;
    photo: File | string | null;
    photoBefore?: string;
    preview: string;
  }>({
    fullName: "",
    email: "",
    role: "",
    photo: null,
    photoBefore: "",
    preview: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        role: profile.role || "",
        photo: null,
        photoBefore: profile.photo || "",
        preview: profile.photo || "",
      });
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        errorNotificationDashboard(
          "File tidak valid. Pastikan file adalah gambar (JPEG, PNG).",
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errorNotificationDashboard(
          "File tidak valid. Pastikan ukuran maksimal 5MB.",
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        photo: file,
        preview: previewUrl,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDummy =
      !formData.photoBefore || formData.photoBefore.includes("dummy");
    if (!formData.photo && isDummy) {
      errorNotificationDashboard("Anda harus mengupload foto profil baru.");
      return;
    }

    try {
      const updated = await updateProfile({
        ...formData,
        photo: formData.photo || formData.photoBefore,
      });
      if (updated) {
        setAuthData({
          name: updated.fullName,
          email: auth.email || "",
          role: auth.role || "",
          photo: updated.photo,
        });
      }
    } catch {
      // error is handled in mutation
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">Loading profile...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your personal profile information and avatar."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "My Profile" },
        ]}
      />

      <Card variant="dashboard">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <UserAvatar
                src={formData.preview || auth.photo}
                name={formData.fullName || auth.name}
                size="xl"
                className="w-28 h-28 border-4 border-amber-500/20 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                aria-label="Change photo"
                title="Change photo"
              >
                <HiOutlineCamera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Profile Picture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, or WEBP. Max 5MB recommended.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Upload New Photo
              </Button>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              disabled
              helperText="Email address cannot be changed."
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Account Role
              </label>
              <div className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-sm">
                <span className="font-bold text-amber-600 dark:text-amber-400 uppercase">
                  {formData.role || auth.role}
                </span>
                <HiOutlineBadgeCheck className="text-amber-500 text-lg" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MyProfilePage;
