import { api } from '@/lib/axios';
import { Job } from '@/types/job';

export interface JobWithApplicationStatus extends Job {
  hasApplied?: boolean;
}

export const getJobsByEmployer = async (): Promise<Job[]> => {
  const response = await api.get<Job[]>('/api/jobs/my-jobs');
  return response.data;
};

export const getAvailableJobs = async (): Promise<JobWithApplicationStatus[]> => {
  const response = await api.get<Job[]>('/api/jobs');
  const applications = await getUserApplications();
  
  // Create a Set of job IDs the user has applied to for O(1) lookup
  const appliedJobIds = new Set(applications.map(app => app.job_id));
  
  return response.data.map(job => ({
    ...job,
    hasApplied: appliedJobIds.has(job.id)
  }));
};

export const getUserApplications = async () => {
  const response = await api.get('/api/applications/my-applications');
  return response.data;
};