from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User, Job, JobApplication
from app.routes.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/employer")
async def get_employer_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics data for employer dashboard."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can access analytics"
        )

    # Get all jobs posted by the employer
    query = text("""
        SELECT 
            j.id,
            j.title as job_title,
            COALESCE(COUNT(ja.id), 0) as total_applications,
            json_build_object(
                'pending', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'pending'), 0),
                'under_review', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'under_review'), 0),
                'interview_scheduled', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'interview_scheduled'), 0),
                'interview_completed', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'interview_completed'), 0),
                'offer_extended', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'offer_extended'), 0),
                'offer_accepted', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'offer_accepted'), 0),
                'offer_declined', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'offer_declined'), 0),
                'rejected', COALESCE(COUNT(*) FILTER (WHERE ja.status = 'rejected'), 0)
            ) as status_counts
        FROM jobs j
        LEFT JOIN job_applications ja ON j.id = ja.job_id
        WHERE j.posted_by_id = :user_id
        GROUP BY j.id, j.title
        ORDER BY j.id DESC
    """)
    
    try:
        # Execute the query and fetch results
        result = await db.execute(
            query,
            {"user_id": current_user.id}
        )
        rows = result.fetchall()
        
        analytics_data = [{
            "job_title": row.job_title,
            "total_applications": row.total_applications,
            "status_counts": row.status_counts
        } for row in rows]
        
        await db.commit()
        return analytics_data
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching analytics data: {str(e)}"
        )