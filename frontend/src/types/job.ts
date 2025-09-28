export interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
  description: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string;
  status: string;
  posted_by_id: number;
  created_at: string;
  updated_at: string;
}