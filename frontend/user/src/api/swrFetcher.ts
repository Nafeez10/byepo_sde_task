import axiosInstance from './axios/axiosInstance';

export const swrFetcher = async (url: string) => {
  const response = await axiosInstance.get(url);
  return response.data;
};
