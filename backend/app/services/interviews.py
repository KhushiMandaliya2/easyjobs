from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime

from app.db.models import Interview, JobApplication
from app.schemas.applications import InterviewCreate, InterviewUpdate, ApplicationStatus


async def create_interview(
    db: AsyncSession,
    interview_data: InterviewCreate,
):
    """Create a new interview for a job application."""
    # Get the application and verify it exists
    application = await db.execute(
        select(JobApplication)
        .filter(JobApplication.id == interview_data.application_id)
        .options(selectinload(JobApplication.interviews))
    )
    application = application.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Create the interview
    interview = Interview(**interview_data.model_dump())
    db.add(interview)
    
    # Update application status
    application.status = ApplicationStatus.INTERVIEW_SCHEDULED
    
    await db.commit()
    await db.refresh(interview)
    return interview


async def get_interview(
    db: AsyncSession,
    interview_id: int
):
    """Get a specific interview by ID."""
    stmt = (
        select(Interview)
        .filter(Interview.id == interview_id)
        .options(selectinload(Interview.application))
    )
    result = await db.execute(stmt)
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return interview


async def update_interview(
    db: AsyncSession,
    interview_id: int,
    interview_data: InterviewUpdate
):
    """Update an interview's details."""
    interview = await get_interview(db, interview_id)
    
    # Update fields
    for field, value in interview_data.model_dump(exclude_unset=True).items():
        setattr(interview, field, value)
    
    if interview_data.status == "completed":
        # Update application status
        interview.application.status = ApplicationStatus.INTERVIEW_COMPLETED
    
    await db.commit()
    await db.refresh(interview)
    return interview


async def get_application_interviews(
    db: AsyncSession,
    application_id: int
):
    """Get all interviews for a specific application."""
    stmt = (
        select(Interview)
        .filter(Interview.application_id == application_id)
        .order_by(Interview.scheduled_at)
    )
    result = await db.execute(stmt)
    interviews = result.scalars().all()
    return interviews