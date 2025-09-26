import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

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
  const { token } = useAuth()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <div className="space-y-1 text-muted-foreground mt-2">
                      <p>{job.company_name}</p>
                      <p>{job.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">
                      Posted {format(new Date(job.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {job.employment_type}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {formatSalaryRange(job.salary_min, job.salary_max)}
                  </span>
                </div>

                <p className="text-muted-foreground line-clamp-2">{job.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}