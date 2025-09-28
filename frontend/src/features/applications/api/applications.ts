import { api } from '@/lib/axios';
import { JobApplication, JobApplicationCreate, JobApplicationUpdate } from '@/types/application';

export const applyForJob = async (applicationData: JobApplicationCreate) => {
  const response = await api.post('/api/applications', applicationData);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get<JobApplication[]>('/api/applications/my-applications');
  return response.data;
};

export const getJobApplications = async (jobId: number) => {
  const response = await api.get<JobApplication[]>(`/api/applications/job/${jobId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId: number, update: JobApplicationUpdate) => {
  const response = await api.put(`/api/applications/${applicationId}/status`, update);
  return response.data;
};

export const checkIfApplied = async (jobId: number) => {
  try {
    const response = await api.get<{ has_applied: boolean }>(`/api/applications/check/${jobId}`);
    return response.data.has_applied;
  } catch (error) {
    return false;
  }
};