import axiosInstance from '@/api/axios/axiosInstance';
import useSWR from 'swr';
import { swrFetcher } from '@/api/swrFetcher';
import { CreateOrganizationPayload, Organization } from './types';

export const OrganizationsAPI = {
  createOrganization: async (data: CreateOrganizationPayload) => {
    const response = await axiosInstance.post('/organizations', data);
    return response.data;
  }
};

export const useGetOrganizations = () => {
  const { data, error, isLoading, mutate } = useSWR<Organization[]>('/organizations', swrFetcher);
  return { orgs: data || [], error, isLoading, mutate };
};
