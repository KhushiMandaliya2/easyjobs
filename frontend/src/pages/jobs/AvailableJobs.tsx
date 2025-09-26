import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { JobApplicationForm } from '@/features/applications/components/JobApplicationForm'

interface Job {
  id: number
  title: string
  company_name: string
  location: string
  status: string
  created_at: string
  description: string
  requirements: string
  salary_min?: number
  salary_max?: number
  employment_type: string
  updated_at: string
  posted_by_id: number
}

export default function AvailableJobs() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }

        const data = await response.json()
        setJobs(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch jobs',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchJobs()
    }
  }, [token, toast])

  function formatSalaryRange(min?: number, max?: number): string {
    if (!min && !max) return 'Salary not specified'
    if (min && !max) return `$${min.toLocaleString()}+`
    if (!min && max) return `Up to $${max.toLocaleString()}`
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`
  }

  const handleApply = (jobId: number) => {
    if (user?.is_supervisor) {
      toast({
        title: 'Error',
        description: 'Employers cannot apply for jobs.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedJobId(jobId);
  };

  const handleApplicationSuccess = () => {
    setSelectedJobId(null);
    toast({
      title: 'Success',
      description: 'Your application has been submitted successfully.',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Available Jobs</h1>
        <p className="text-muted-foreground">Find your next opportunity</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">No jobs available at the moment.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-all"
              role="article"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <div className="space-y-1 text-muted-foreground mt-2">
                      <p>{job.company_name}</p>
                      <p>{job.location}</p>
                      <p>{job.employment_type}</p>
                      <p>{formatSalaryRange(job.salary_min, job.salary_max)}</p>
                      <p>Posted {format(new Date(job.created_at), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate(`/jobs/${job.id}`)} variant="secondary">
                      View Details
                    </Button>
                    <Button onClick={() => handleApply(job.id)}>
                      Apply Now
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">{job.description}</p>
              </div>
            </div>
          ))
        )}

        <Dialog open={selectedJobId !== null} onOpenChange={() => setSelectedJobId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Job</DialogTitle>
            </DialogHeader>
            {selectedJobId && (
              <JobApplicationForm
                jobId={selectedJobId}
                onSuccess={handleApplicationSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}