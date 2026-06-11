import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi, setAccessToken } from '../api';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest } from '../types';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  // Initialize auth state on mount (runs only once)
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const response = await authApi.refresh();
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    user,
    isAuthenticated,
    isLoading,
  };
};

export const useLogin = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setUser(response.data.user);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setUser(response.data.user);
      toast.success('Registration successful! Welcome!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const { logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      storeLogout();
      setAccessToken(null);
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Still logout locally even if server request fails
      storeLogout();
      setAccessToken(null);
      queryClient.clear();
      navigate('/login');
    },
  });
};
