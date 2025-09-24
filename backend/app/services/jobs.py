from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Job, User
from app.schemas.jobs import JobCreate, JobUpdate
from fastapi import HTTPException, status


async def get_jobs_by_employer(db: AsyncSession, employer_id: int):
    """Get all jobs posted by a specific employer."""
    result = await db.execute(
        select(Job).filter(Job.posted_by_id == employer_id).order_by(Job.created_at.desc())
    )
    return result.scalars().all()


async def get_job_by_id(db: AsyncSession, job_id: int):
    """Get a specific job by its ID."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job


async def create_job(db: AsyncSession, job_data: JobCreate, employer_id: int):
    """Create a new job posting."""
    job = Job(
        **job_data.model_dump(),
        posted_by_id=employer_id
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def update_job(
    db: AsyncSession, 
    job_id: int, 
    job_data: JobUpdate, 
    employer_id: int
):
    """Update a job posting."""
    job = await get_job_by_id(db, job_id)
    
    # Verify ownership
    if job.posted_by_id != employer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job"
        )

    # Update only provided fields
    update_data = job_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    await db.commit()
    await db.refresh(job)
    return job


async def delete_job(db: AsyncSession, job_id: int, employer_id: int):
    """Delete a job posting."""
    job = await get_job_by_id(db, job_id)
    
    # Verify ownership
    if job.posted_by_id != employer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job"
        )

    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted successfully"}