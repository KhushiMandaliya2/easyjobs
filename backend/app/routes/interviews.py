from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.auth import get_current_user
from app.db.models import User
from app.services import interviews as interview_service
from app.schemas.applications import InterviewCreate, InterviewUpdate, InterviewResponse

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post("", response_model=InterviewResponse)
async def schedule_interview(
    interview_data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Schedule a new interview for a job application."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can schedule interviews"
        )
    
    return await interview_service.create_interview(db, interview_data)


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview_details(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific interview."""
    interview = await interview_service.get_interview(db, interview_id)
    
    # Check if user has permission to view this interview
    if not (current_user.is_supervisor or current_user.id == interview.application.applicant_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this interview"
        )
    
    return interview


@router.patch("/{interview_id}", response_model=InterviewResponse)
async def update_interview_details(
    interview_id: int,
    interview_data: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an interview's details."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update interviews"
        )
    
    return await interview_service.update_interview(db, interview_id, interview_data)


@router.get("/application/{application_id}", response_model=list[InterviewResponse])
async def get_application_interviews(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all interviews for a specific application."""
    # First get the application to check permissions
    application = await interview_service.get_application_with_relationships(db, application_id)
    
    # Check if user has permission to view these interviews
    if not (current_user.is_supervisor or current_user.id == application.applicant_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view these interviews"
        )
    
    return await interview_service.get_application_interviews(db, application_id)