import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  FileText,
  Camera,
  Save,
  Lock,
} from "lucide-react";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useChangePassword,
} from "../hooks/useProfile";
import { Button, Input, Loading } from "../components/ui";
import type { UpdateProfileRequest } from "../types";

const profileSchema = z.object({
  firstName: z
    .string()
    .max(100, "First name must be less than 100 characters")
    .optional(),
  lastName: z
    .string()
    .max(100, "Last name must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const changePasswordMutation = useChangePassword();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          bio: profile.bio || "",
        }
      : undefined,
  });

  const onSubmit = (data: ProfileFormData) => {
    const updateData: UpdateProfileRequest = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.bio) updateData.bio = data.bio;

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          resetPassword();
          setIsChangingPassword(false);
        },
      }
    );
  };

  const handlePasswordCancel = () => {
    resetPassword();
    setIsChangingPassword(false);
  };

  if (isLoading) {
    return <Loading text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-red-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>

        {/* Profile Content */}
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="relative -mt-16 mb-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <User className="w-16 h-16 text-blue-600" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-lg"
                disabled={uploadAvatarMutation.isPending}
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username}
                </h1>
                <p className="text-gray-600">@{profile.username}</p>
              </div>
              {!isEditing && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {profile.email}
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {profile.role}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
              <Input
                label="First Name"
                placeholder="Your first name"
                autoComplete="off"
                error={errors.firstName?.message}
                {...register("firstName")}
              />

              <Input
                label="Last Name"
                placeholder="Your last name"
                autoComplete="off"
                error={errors.lastName?.message}
                {...register("lastName")}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Bio
                </label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  placeholder="Tell us about yourself"
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateProfileMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Bio
                  </h3>
                  <p className="text-gray-900">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden mt-6">
        <div className="px-8 py-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Change Password
              </h2>
            </div>
            {!isChangingPassword && (
              <Button
                variant="secondary"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </Button>
            )}
          </div>
        </div>

        <div className="px-8 py-6">
          {isChangingPassword ? (
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-6 max-w-md"
              autoComplete="off"
            >
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                autoComplete="current-password"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword("currentPassword")}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min. 8 characters)"
                autoComplete="new-password"
                error={passwordErrors.newPassword?.message}
                {...registerPassword("newPassword")}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword("confirmPassword")}
              />

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={changePasswordMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePasswordCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              Update your password to keep your account secure. We recommend
              using a strong password with at least 8 characters, including
              uppercase, lowercase, and numbers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
