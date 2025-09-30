import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/Button'
import { Pencil } from 'lucide-react'

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

export default function EmployerJobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { toast } = useToast()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch job details')
        }

        const data = await response.json()
        setJob(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch job details',
          variant: 'destructive',
        })
        navigate('/employer/jobs')
      } finally {
        setIsLoading(false)
      }
    }

    if (token && id) {
      fetchJob()
    }
  }, [token, id, toast, navigate])

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        Loading job details...
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
          <div className="space-y-1 text-muted-foreground">
            <p>{job.company_name}</p>
            <p>{job.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            job.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          }`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
          <Button
            variant="outline"
            onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Job
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <div className="prose dark:prose-invert max-w-none">
            {job.description.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <div className="prose dark:prose-invert max-w-none">
            {job.requirements.split('\n').map((requirement, index) => (
              <p key={index}>{requirement}</p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Employment Type</h2>
            <p className="text-muted-foreground">
              {job.employment_type.charAt(0).toUpperCase() + job.employment_type.slice(1)}
            </p>
          </div>
          {(job.salary_min || job.salary_max) && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Salary Range</h2>
              <p className="text-muted-foreground">
                {job.salary_min && job.salary_max
                  ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                  : job.salary_min
                  ? `From $${job.salary_min.toLocaleString()}`
                  : `Up to $${job.salary_max?.toLocaleString()}`}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Posted on {new Date(job.created_at).toLocaleDateString()}
            {job.updated_at !== job.created_at && 
              ` • Updated on ${new Date(job.updated_at).toLocaleDateString()}`}
          </p>
        </div>
      </div>
    </div>
  )
}