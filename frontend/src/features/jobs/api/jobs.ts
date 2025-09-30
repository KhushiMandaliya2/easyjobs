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

export const getApplicationStatus = async (jobId: number) => {
  try {
    const applications = await getUserApplications();
    return applications.some((app: any) => app.job_id === jobId);
  } catch (error) {
    console.error('Error checking application status:', error);
    return false;
  }
};

export const getJobById = async (jobId: number): Promise<JobWithApplicationStatus> => {
  const response = await api.get<Job>(`/api/jobs/${jobId}`);
  const applications = await getUserApplications();
  
  // Check if user has applied to this job
  const hasApplied = applications.some(app => app.job_id === jobId);
  
  return {
    ...response.data,
    hasApplied
  };
};