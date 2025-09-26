import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { JobApplicationForm } from '@/features/applications/components/JobApplicationForm';
import { JobApplicationsList } from '@/features/applications/components/JobApplicationsList';

interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
  status: string;
  created_at: string;
  description: string;
  requirements: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  updated_at: string;
  posted_by_id: number;
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const data = await response.json();
        setJob(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch job details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) {
      fetchJob();
    }
  }, [id, token, toast]);

  const formatSalaryRange = (min?: number, max?: number): string => {
    if (!min && !max) return 'Salary not specified';
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  const handleApply = () => {
    if (user?.is_supervisor) {
      toast({
        title: 'Error',
        description: 'Employers cannot apply for jobs.',
        variant: 'destructive',
      });
      return;
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    toast({
      title: 'Success',
      description: 'Your application has been submitted successfully.',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg">
        <p className="text-muted-foreground">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">{job.title}</h1>
        <div className="space-y-2 text-muted-foreground">
          <p className="text-xl">{job.company_name}</p>
          <p>{job.location}</p>
          <p>{job.employment_type}</p>
          <p>{formatSalaryRange(job.salary_min, job.salary_max)}</p>
          <p>Posted {format(new Date(job.created_at), 'PPP')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="whitespace-pre-line">{job.description}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Requirements</h2>
          <p className="whitespace-pre-line">{job.requirements}</p>
        </section>

        {!user?.is_supervisor && (
          <Button onClick={handleApply} size="lg">
            Apply for this position
          </Button>
        )}
      </div>

      {/* Show applications list for employers */}
      {user?.is_supervisor && job.posted_by_id === user.id && (
        <div className="mt-8">
          <JobApplicationsList jobId={job.id} />
        </div>
      )}

      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          <JobApplicationForm jobId={job.id} onSuccess={handleApplicationSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}