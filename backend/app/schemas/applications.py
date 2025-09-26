from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .jobs import JobResponse
from .auth import UserResponse


class JobApplicationBase(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: str


class JobApplicationCreate(JobApplicationBase):
    job_id: int


class JobApplicationUpdate(JobApplicationBase):
    status: Optional[str] = None


class JobApplicationResponse(JobApplicationBase):
    id: int
    job_id: int
    applicant_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    job: JobResponse
    applicant: UserResponse

    class Config:
        from_attributes = True