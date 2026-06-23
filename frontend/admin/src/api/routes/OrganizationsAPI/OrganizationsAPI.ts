import axiosInstance from '@/api/axios/axiosInstance';
import { InviteUserPayload } from './types';

export const OrganizationsAPI = {
  inviteUser: async (data: InviteUserPayload) => {
    const response = await axiosInstance.post('/organizations/invites', data);
    return response.data;
  }
};
