import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi } from '../api';
import type { UpdateProfileRequest } from '../types';
import { useAuthStore } from '../store/authStore';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    select: (data) => data.data,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setUser(response.data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar uploaded successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to upload avatar';
      toast.error(message);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to change password';
      toast.error(message);
    },
  });
};
