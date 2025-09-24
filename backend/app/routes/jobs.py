from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.database import get_db
from app.db.models import User, Job
from app.schemas.jobs import JobCreate, JobUpdate, JobResponse
from app.services.jobs import (
    get_jobs_by_employer,
    get_job_by_id,
    create_job,
    update_job,
    delete_job
)
from app.routes.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/my-jobs", response_model=List[JobResponse])
async def list_my_jobs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all jobs posted by the current employer."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can access job postings"
        )
    return await get_jobs_by_employer(db, current_user.id)


@router.post("", response_model=JobResponse)
async def create_job_posting(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new job posting."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create job postings"
        )
    return await create_job(db, job_data, current_user.id)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific job posting."""
    job = await get_job_by_id(db, job_id)
    # Allow access to job details for both employers and job seekers
    return job


@router.put("/{job_id}", response_model=JobResponse)
async def update_job_posting(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a job posting."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update job postings"
        )
    return await update_job(db, job_id, job_data, current_user.id)


@router.delete("/{job_id}")
async def delete_job_posting(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a job posting."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can delete job postings"
        )
    return await delete_job(db, job_id, current_user.id)


@router.get("", response_model=List[JobResponse])
async def list_active_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all active job postings."""
    # This endpoint is accessible to both employers and job seekers
    result = await db.execute(
        select(Job).filter(Job.status == "active").order_by(Job.created_at.desc())
    )
    return result.scalars().all()