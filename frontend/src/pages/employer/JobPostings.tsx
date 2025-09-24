import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Job {
  id: number
  title: string
  company_name: string
  location: string
  status: string
  created_at: string
}

export default function JobPostings() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Placeholder data - we'll replace this with actual API call later
  const jobs: Job[] = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company_name: "Tech Corp",
      location: "San Francisco, CA",
      status: "active",
      created_at: "2025-09-23"
    },
    // Add more placeholder jobs if needed
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings</p>
        </div>
        <Button onClick={() => navigate('/employer/jobs/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job Posting
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            Loading jobs...
          </div>
        }
      >
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No job postings yet.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => navigate('/employer/jobs/new')}
              >
                Create your first job posting
              </Button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-all"
                onClick={() => navigate(`/employer/jobs/${job.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p>{job.company_name}</p>
                      <p>{job.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground mt-2">
                      Posted on {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Suspense>
    </div>
  )
}