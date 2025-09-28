from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .jobs import JobResponse
from .auth import UserResponse


class JobApplicationBase(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: str


from enum import Enum

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    OFFER_EXTENDED = "offer_extended"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"
    REJECTED = "rejected"


class InterviewType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    HR = "hr"
    SYSTEM_DESIGN = "system_design"
    CULTURE_FIT = "culture_fit"


class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"

class JobApplicationCreate(JobApplicationBase):
    job_id: int

class JobApplicationUpdate(BaseModel):
    status: str  # Will validate against ApplicationStatus values


class InterviewBase(BaseModel):
    scheduled_at: datetime
    duration_minutes: int
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    interview_type: InterviewType
    notes: Optional[str] = None


class InterviewCreate(InterviewBase):
    application_id: int


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[InterviewStatus] = None


class InterviewResponse(InterviewBase):
    id: int
    application_id: int
    status: InterviewStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobOfferCreate(BaseModel):
    offer_details: str
    offer_salary: float
    offer_expiry_date: datetime


class JobApplicationResponse(JobApplicationBase):
    id: int
    job_id: int
    applicant_id: int
    status: str
    offer_details: Optional[str] = None
    offer_salary: Optional[float] = None
    offer_expiry_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    job: JobResponse
    applicant: UserResponse
    interviews: Optional[list[InterviewResponse]] = []

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
        from_attributes = True