import axiosInstance from '@/api/axios/axiosInstance';
import useSWR from 'swr';
import { swrFetcher } from '@/api/swrFetcher';
import { LoginPayload, SignupPayload } from './types';

export const AuthAPI = {
  login: async (data: LoginPayload) => {
    // In original code super-admin login was using /auth/super-admin/login or just /auth/login? Let's use what was in AuthAPI.ts
    // Wait, let's check super-admin/src/app/login/page.tsx. 
    // Ah, super-admin/src/app/login/page.tsx uses `axiosInstance.post('/auth/super-admin/login', { email, password });`
    // So AuthAPI.login wasn't even used there! 
    const response = await axiosInstance.post('/auth/super-admin/login', data);
    return response.data;
  }
};

export const useUser = () => {
  const { data, error, isLoading, mutate } = useSWR('/auth/me', swrFetcher);
  return { user: data || null, error, isLoading, mutate };
};
