import axiosInstance from '@/api/axios/axiosInstance';
import useSWR from 'swr';
import { swrFetcher } from '@/api/swrFetcher';
import { FlagStatus } from './types';

export const FlagsAPI = {
  checkStatuses: async (keysParam: string): Promise<FlagStatus[]> => {
    const response = await axiosInstance.get(`/flags/check?keys=${keysParam}`);
    return response.data;
  }
};

export const useGetFeatureFlagKeys = () => {
  const { data, error, isLoading, mutate } = useSWR<string[]>('/flags/keys', swrFetcher);
  return { availableKeys: data || [], error, isLoading, mutate };
};
