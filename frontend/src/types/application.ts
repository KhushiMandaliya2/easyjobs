import { Job } from './job';

interface User {
  id: number;
  username: string;
  email: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  applicant_id: number;
  status: string;
  cover_letter: string;
  resume_url: string;
  created_at: string;
  updated_at: string;
  applicant?: User;
  job?: Job;
}

export interface JobApplicationCreate {
  job_id: number;
  cover_letter: string;
  resume_url: string;
}

export interface JobApplicationUpdate {
  status: string;
}

export enum ApplicationStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  INTERVIEW_SCHEDULED = "interview_scheduled",
  INTERVIEW_COMPLETED = "interview_completed",
  OFFER_EXTENDED = "offer_extended",
  OFFER_ACCEPTED = "offer_accepted",
  OFFER_DECLINED = "offer_declined",
  REJECTED = "rejected"
}