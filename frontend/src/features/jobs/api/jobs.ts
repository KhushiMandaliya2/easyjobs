import { api } from '@/lib/axios';
import { Job } from '@/types/job';

export const getJobsByEmployer = async (): Promise<Job[]> => {
  const response = await api.get<Job[]>('/api/jobs/my-jobs');
  return response.data;
};