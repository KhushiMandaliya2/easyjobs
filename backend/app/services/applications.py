from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db.models import JobApplication, Job
from app.schemas.applications import JobApplicationCreate, JobApplicationUpdate, ApplicationStatus
from fastapi import HTTPException, status


async def check_application_exists(
    db: AsyncSession,
    job_id: int,
    applicant_id: int
) -> bool:
    """Check if a user has already applied to a specific job."""
    result = await db.execute(
        select(JobApplication).filter(
            JobApplication.job_id == job_id,
            JobApplication.applicant_id == applicant_id
        )
    )
    return result.scalar_one_or_none() is not None


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
    
    # Explicitly load relationships
    await db.refresh(application, ['job', 'applicant'])
    return application


async def get_application_by_id(db: AsyncSession, application_id: int):
    """Get a specific job application."""
    stmt = (
        select(JobApplication)
        .filter(JobApplication.id == application_id)
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.applicant)
        )
    )
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application


async def get_applications_by_job(db: AsyncSession, job_id: int):
    """Get all applications for a specific job."""
    stmt = (
        select(JobApplication)
        .filter(JobApplication.job_id == job_id)
        .order_by(JobApplication.created_at.desc())
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.applicant)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_applications_by_applicant(db: AsyncSession, applicant_id: int):
    """Get all applications by a specific applicant."""
    # Include the job relationship in the query
    stmt = (
        select(JobApplication)
        .filter(JobApplication.applicant_id == applicant_id)
        .order_by(JobApplication.created_at.desc())
        .options(
            selectinload(JobApplication.job)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_application_with_relationships(db: AsyncSession, application_id: int):
    """Get a job application with all its relationships loaded."""
    stmt = (
        select(JobApplication)
        .where(JobApplication.id == application_id)
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.applicant)
        )
    )
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application

async def update_application_status(
    db: AsyncSession,
    application_id: int,
    new_status: str,
    employer_id: int
):
    """Update a job application's status."""
    # Validate the status value
    if new_status not in ["pending", "under_review", "accepted", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status value"
        )
    # Get application with relationships loaded
    application = await get_application_with_relationships(db, application_id)
    
    # Verify the employer owns the job
    if application.job.posted_by_id != employer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update applications for jobs you posted"
        )
    
    # Update the status
    application.status = new_status
    await db.commit()
    
    # Refresh with relationships
    refreshed_application = await get_application_with_relationships(db, application_id)
    return refreshed_application