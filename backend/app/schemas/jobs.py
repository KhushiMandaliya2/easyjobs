from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class JobBase(BaseModel):
    title: str
    company_name: str
    location: str
    description: str
    requirements: str
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    employment_type: str  # full-time, part-time, contract
    status: str = "active"  # active, closed


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    employment_type: Optional[str] = None
    status: Optional[str] = None


class JobResponse(JobBase):
    id: int
    posted_by_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True