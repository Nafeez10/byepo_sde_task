import axiosInstance from '@/api/axios/axiosInstance';
import useSWR from 'swr';
import { swrFetcher } from '@/api/swrFetcher';
import { CreateFlagPayload, UpdateFlagPayload, FeatureFlag } from './types';

export const FlagsAPI = {
  createFlag: async (data: CreateFlagPayload) => {
    const response = await axiosInstance.post('/flags', data);
    return response.data;
  },
  updateFlag: async (id: string, data: UpdateFlagPayload) => {
    const response = await axiosInstance.patch(`/flags/${id}`, data);
    return response.data;
  },
  deleteFlag: async (id: string) => {
    const response = await axiosInstance.delete(`/flags/${id}`);
    return response.data;
  }
};

export const useGetFeatureFlags = () => {
  const { data, error, isLoading, mutate } = useSWR<FeatureFlag[]>('/flags', swrFetcher);
  return { flags: data || [], error, isLoading, mutate };
};
