from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import JobApplication, Job
from app.schemas.applications import JobApplicationCreate, JobApplicationUpdate
from fastapi import HTTPException, status


async def create_application(
    db: AsyncSession,
    application_data: JobApplicationCreate,
    applicant_id: int
):
    """Create a new job application."""
    # Check if user has already applied
    existing = await db.execute(
        select(JobApplication).filter(
            JobApplication.job_id == application_data.job_id,
            JobApplication.applicant_id == applicant_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this job"
        )

    # Check if job exists and is active
    job = await db.execute(
        select(Job).filter(Job.id == application_data.job_id)
    )
    job = job.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    if job.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is no longer accepting applications"
        )

    application = JobApplication(
        **application_data.model_dump(),
        applicant_id=applicant_id
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


async def get_application_by_id(db: AsyncSession, application_id: int):
    """Get a specific job application."""
    result = await db.execute(
        select(JobApplication).filter(JobApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application


async def get_applications_by_job(db: AsyncSession, job_id: int):
    """Get all applications for a specific job."""
    result = await db.execute(
        select(JobApplication)
        .filter(JobApplication.job_id == job_id)
        .order_by(JobApplication.created_at.desc())
    )
    return result.scalars().all()


async def get_applications_by_applicant(db: AsyncSession, applicant_id: int):
    """Get all applications by a specific applicant."""
    result = await db.execute(
        select(JobApplication)
        .filter(JobApplication.applicant_id == applicant_id)
        .order_by(JobApplication.created_at.desc())
    )
    return result.scalars().all()


async def update_application_status(
    db: AsyncSession,
    application_id: int,
    status: str,
    employer_id: int
):
    """Update a job application's status."""
    application = await get_application_by_id(db, application_id)
    
    # Verify the employer owns the job
    if application.job.posted_by_id != employer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update applications for jobs you posted"
        )
    
    application.status = status
    await db.commit()
    await db.refresh(application)
    return application