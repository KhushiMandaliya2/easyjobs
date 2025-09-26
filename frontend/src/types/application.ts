export interface JobApplication {
  id: number;
  job_id: number;
  applicant_id: number;
  status: ApplicationStatus;
  cover_letter: string;
  resume_url: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationCreate {
  job_id: number;
  cover_letter: string;
  resume_url: string;
}

export interface JobApplicationUpdate {
  status: ApplicationStatus;
}

export enum ApplicationStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}