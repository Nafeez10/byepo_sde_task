import axiosInstance from '@/api/axios/axiosInstance';
import useSWR from 'swr';
import { swrFetcher } from '@/api/swrFetcher';
import { LoginPayload, SignupPayload } from './types';

export const AuthAPI = {
  login: async (data: LoginPayload) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },
  signup: async (data: SignupPayload) => {
    const response = await axiosInstance.post('/auth/admin/signup', data);
    return response.data;
  },
  signupWithInvite: async (data: { inviteId: string; password: string }) => {
    const response = await axiosInstance.post('/auth/admin/invite-signup', data);
    return response.data;
  }
};

export const useUser = () => {
  const { data, error, isLoading, mutate } = useSWR('/auth/me', swrFetcher);
  return { user: data || null, error, isLoading, mutate };
};
