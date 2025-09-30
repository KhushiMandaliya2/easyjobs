from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User, Job, JobApplication
from app.routes.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

from datetime import datetime
from typing import Optional
from fastapi import Query

@router.get("/employer")
async def get_employer_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
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

@router.get("/employer/timeline")
async def get_employer_timeline_analytics(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get timeline analytics data for employer dashboard."""
    if not current_user.is_supervisor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can access analytics"
        )

    try:
        # Parse date strings into datetime objects
        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

        query = text("""
            WITH RECURSIVE dates AS (
                SELECT CAST(:start_date AS DATE) as date
                UNION ALL
                SELECT CAST((CAST(date AS DATE) + INTERVAL '1 day') AS DATE)
                FROM dates
                WHERE CAST(date AS DATE) < CAST(:end_date AS DATE)
            )
            SELECT 
                d.date as application_date,
                COALESCE(COUNT(ja.id), 0) as application_count
            FROM dates d
            LEFT JOIN jobs j ON j.posted_by_id = :user_id
            LEFT JOIN job_applications ja ON ja.job_id = j.id 
                AND date_trunc('day', ja.created_at AT TIME ZONE 'UTC')::DATE = d.date
            GROUP BY d.date
            ORDER BY d.date ASC
        """)

        result = await db.execute(
            query,
            {
                "start_date": start_date,
                "end_date": end_date,
                "user_id": current_user.id
            }
        )
        
        rows = result.fetchall()
        
        timeline_data = [{
            "date": row.application_date.strftime("%Y-%m-%d"),
            "applications": row.application_count
        } for row in rows]
        
        await db.commit()
        return timeline_data
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching timeline data: {str(e)}"
        )