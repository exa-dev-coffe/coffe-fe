import React, { useEffect, useRef, useState } from "react";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/features/profile/hooks/useProfile.ts";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import useAuth from "@/features/auth/hooks/useAuth.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Input from "@/components/ui/Input.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import Modal from "@/components/ui/Modal.tsx";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import ImageCropperModal from "@/components/ui/ImageCropperModal.tsx";
import type { CropResult } from "@/core/utils/cropImage.ts";
import { HiOutlineCamera, HiOutlineBadgeCheck } from "react-icons/hi";
import { FaApple } from "react-icons/fa";
import GoogleIcon from "@/assets/images/google-logo.svg";
import { useLocation } from "react-router";

export const MyProfilePage: React.FC = () => {
  const { data: profile, isLoading, refetch } = useProfileQuery();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();
  const { auth, setAuthData } = useAuthContext();
  const {
    linkAppleAccount,
    unbindApple,
    linkGoogleAccount,
    loading: authLoading,
  } = useAuth();
  const { errorNotificationDashboard, errorNotificationClient } =
    useNotificationContext();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const notifyError = isDashboard
    ? errorNotificationDashboard
    : errorNotificationClient;

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
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = useState("avatar.webp");
  const [cropperFileSize, setCropperFileSize] = useState(0);
  const [isUnbindConfirmOpen, setIsUnbindConfirmOpen] = useState(false);

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
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(
          file.type.toLowerCase(),
        )
      ) {
        notifyError(
          "Invalid file. Please make sure the file is an image (JPEG, PNG, WEBP).",
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        notifyError("Invalid file. Please make sure maximum size is 5MB.");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setCropperRawSrc(previewUrl);
      setCropperFileName(file.name);
      setCropperFileSize(file.size);
      setIsCropModalOpen(true);
    }
  };

  const handleCropComplete = (result: CropResult) => {
    setFormData((prev) => ({
      ...prev,
      photo: result.file,
      preview: result.previewUrl,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDummy =
      !formData.photoBefore || formData.photoBefore.includes("dummy");
    if (!formData.photo && isDummy) {
      notifyError("You must upload a new profile picture.");
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

  const handleLinkApple = async () => {
    const success = await linkAppleAccount();
    if (success) {
      refetch();
    }
  };

  const handleLinkGoogle = async () => {
    const success = await linkGoogleAccount();
    if (success) {
      refetch();
    }
  };

  const handleConfirmUnbindApple = async () => {
    const success = await unbindApple();
    setIsUnbindConfirmOpen(false);
    if (success) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">Loading profile...</div>
    );
  }

  return (
    <div
      className={`space-y-6 max-w-4xl ${isDashboard ? "" : "container mx-auto px-4 sm:px-6 py-8"}`}
    >
      <PageHeader
        title="Account Settings"
        subtitle="Manage your personal profile information and avatar."
        breadcrumb={
          isDashboard
            ? [
                { label: "Dashboard", to: "/dashboard/menu" },
                { label: "My Profile" },
              ]
            : [{ label: "Home", to: "/" }, { label: "My Profile" }]
        }
      />

      <Card variant={isDashboard ? "dashboard" : "glass"}>
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
              helperText={
                formData.email.toLowerCase().endsWith("@privaterelay.appleid.com")
                  ? "This is an Apple private relay email. Link your Google account below to update this to your real email."
                  : "Email address cannot be changed."
              }
            />

            {isDashboard && (
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
            )}
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

      {/* Connected Accounts Section */}
      <Card variant={isDashboard ? "dashboard" : "glass"}>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Connected Accounts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Link external social identity providers to your account for quick and secure sign-in.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Google Account Item */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm flex-shrink-0">
                  <img src={GoogleIcon} alt="Google" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      Google Account
                    </span>
                    {profile?.isGoogleLinked ? (
                      <Badge variant="success" size="sm" dot>
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Not Linked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {profile?.isGoogleLinked
                      ? profile.googleEmail || profile.email || "Linked with Google Account"
                      : formData.email.toLowerCase().endsWith("@privaterelay.appleid.com")
                      ? "Link your Google account to replace your Apple relay email with your real email."
                      : "Connect your Google account for quick sign-in."}
                  </p>
                </div>
              </div>

              <div>
                {!profile?.isGoogleLinked && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={authLoading}
                    onClick={handleLinkGoogle}
                    className="flex items-center gap-2"
                  >
                    <img src={GoogleIcon} alt="Google" className="w-4 h-4 object-contain" />
                    <span>Link Google</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Apple Account Item */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-slate-800 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <FaApple className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      Apple ID
                    </span>
                    {profile?.isAppleLinked ? (
                      <Badge variant="success" size="sm" dot>
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Not Linked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {profile?.isAppleLinked
                      ? profile.appleEmail || "Linked with Apple Account"
                      : "Connect your Apple ID for 1-click popup login."}
                  </p>
                  {profile?.isAppleLinked &&
                    formData.email.toLowerCase().endsWith("@privaterelay.appleid.com") &&
                    !profile?.isGoogleLinked && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        ⚠️ Link your Google account first before you can unlink Apple.
                      </p>
                    )}
                </div>
              </div>

              <div>
                {profile?.isAppleLinked ? (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    loading={authLoading}
                    disabled={
                      formData.email.toLowerCase().endsWith("@privaterelay.appleid.com") &&
                      !profile?.isGoogleLinked
                    }
                    onClick={() => setIsUnbindConfirmOpen(true)}
                  >
                    Unlink
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={authLoading}
                    onClick={handleLinkApple}
                    className="flex items-center gap-2"
                  >
                    <FaApple className="w-4 h-4" />
                    <span>Link Apple</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={cropperRawSrc}
        fileName={cropperFileName}
        fileSizeBytes={cropperFileSize}
        initialAspectRatio={1 / 1}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

      {/* Unbind Apple Confirmation Modal */}
      <Modal
        show={isUnbindConfirmOpen}
        handleClose={() => setIsUnbindConfirmOpen(false)}
        title="Unlink Apple Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to disconnect your Apple ID from this account? You won&apos;t be able to sign in with Apple until you link it again.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsUnbindConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              loading={authLoading}
              onClick={handleConfirmUnbindApple}
            >
              Yes, Unlink
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyProfilePage;
