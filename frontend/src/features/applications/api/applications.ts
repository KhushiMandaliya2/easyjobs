// Ensure the path is correct and the file exists
import axios from 'axios';
import { JobApplication, JobApplicationCreate, JobApplicationUpdate } from '@/types/application';

export const applyForJob = async (applicationData: JobApplicationCreate) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/applications`, applicationData);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await axios.get<JobApplication[]>(`${import.meta.env.VITE_API_URL}/api/applications/my-applications`);
  return response.data;
};

export const getJobApplications = async (jobId: number) => {
  const response = await axios.get<JobApplication[]>(`${import.meta.env.VITE_API_URL}/api/applications/job/${jobId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId: number, update: JobApplicationUpdate) => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/applications/${applicationId}/status`, update);
  return response.data;
};