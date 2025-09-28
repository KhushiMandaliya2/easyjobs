from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.db.models import User, JobApplication
from app.schemas.applications import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse,
    JobOfferCreate
)
from app.services.applications import (
    create_application,
    get_application_by_id,
    get_applications_by_job,
    get_applications_by_applicant,
    update_application_status,
    check_application_exists,
    extend_job_offer,
    respond_to_offer
)
from app.routes.auth import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=JobApplicationResponse)
async def apply_for_job(
    application_data: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Apply for a job."""
    if current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employers cannot apply for jobs"
        )
    return await create_application(db, application_data, current_user.id)


@router.get("/my-applications", response_model=List[JobApplicationResponse])
async def list_my_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all job applications for the current user."""
    return await get_applications_by_applicant(db, current_user.id)


@router.get("/job/{job_id}", response_model=List[JobApplicationResponse])
async def list_job_applications(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all applications for a specific job (only for the employer who posted the job)."""
    applications = await get_applications_by_job(db, job_id)
    if not applications:
        return []
        
    # Check if the current user is the employer who posted the job
    if applications[0].job.posted_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view applications for jobs you posted"
        )
    return applications


@router.put("/{application_id}/status", response_model=JobApplicationResponse)
async def update_application(
    application_id: int,
    application_update: JobApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an application's status (only for employers)."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update application status"
        )
    
    try:
        # Ensure the status is lowercase to match our expected values
        status_value = application_update.status.lower()
        
        updated_application = await update_application_status(
            db,
            application_id,
            status_value,
            current_user.id
        )
        
        # Convert to response model
        return JobApplicationResponse.from_orm(updated_application)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating application status: {str(e)}"
        )


@router.get("/check/{job_id}")
async def check_if_applied(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if the current user has applied to a specific job."""
    if current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employers cannot apply for jobs"
        )
    return await check_application_exists(db, job_id, current_user.id)


@router.post("/{application_id}/offer", response_model=JobApplicationResponse)
async def make_job_offer(
    application_id: int,
    offer_data: JobOfferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Extend a job offer to an applicant (only for employers)."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can make job offers"
        )
    
    return await extend_job_offer(db, application_id, current_user.id, offer_data)


@router.post("/{application_id}/offer/respond", response_model=JobApplicationResponse)
async def respond_to_job_offer(
    application_id: int,
    accept: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept or decline a job offer (only for applicants)."""
    if current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employers cannot respond to job offers"
        )
    
    return await respond_to_offer(db, application_id, current_user.id, accept)