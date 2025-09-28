from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from passlib.context import CryptContext
import secrets


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # Roles: "user", "admin", "moderator"
    is_supervisor = Column(Boolean, default=False)  # Can post jobs if True
    is_superuser = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    reset_token = Column(String, unique=True, nullable=True)

    def verify_password(self, password: str) -> bool:
        """Check if a plain password matches the hashed password."""
        return pwd_context.verify(password, self.hashed_password)

    def set_password(self, password: str):
        """Hash and store a password."""
        self.hashed_password = pwd_context.hash(password)

    def generate_reset_token(self):
        """Generate a secure reset token."""
        self.reset_token = secrets.token_urlsafe(32)

    def clear_reset_token(self):
        """Clear password reset token after use."""
        self.reset_token = None


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    employment_type = Column(String, nullable=False)  # full-time, part-time, contract
    status = Column(String, default="active")  # active, closed
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Foreign key to link job to the user who posted it
    posted_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship to get the user who posted the job
    posted_by = relationship("User", backref="posted_jobs")
    
    def __repr__(self):
        return f"<Job {self.title} at {self.company_name}>"


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys for relationships
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Application details
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String, nullable=False)  # URL or path to stored resume
    status = Column(String, default="pending")  # pending, under_review, interview_scheduled, interview_completed, offer_extended, offer_accepted, offer_declined, rejected
    
    # Offer details
    offer_details = Column(Text, nullable=True)
    offer_salary = Column(Float, nullable=True)
    offer_expiry_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", backref="applications")
    applicant = relationship("User", backref="job_applications")
    interviews = relationship("Interview", back_populates="application")
    
    def __repr__(self):
        return f"<JobApplication {self.applicant_id} for Job {self.job_id}>"


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    location = Column(String, nullable=True)  # Can be a physical location or virtual meeting link
    meeting_link = Column(String, nullable=True)
    interview_type = Column(String, nullable=False)  # technical, behavioral, hr, etc.
    notes = Column(Text, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled, rescheduled
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    application = relationship("JobApplication", back_populates="interviews")
    
    def __repr__(self):
        return f"<Interview for Application {self.application_id} at {self.scheduled_at}>"
