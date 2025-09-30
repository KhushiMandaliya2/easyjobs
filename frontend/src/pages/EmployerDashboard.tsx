import { Suspense } from 'react'
import { Briefcase, Users, LineChart } from 'lucide-react'
import { useAppDispatch } from '../context/AppContext'
import { showNotification } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

export default function EmployerDashboard() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleCardClick = (title: string) => {
    switch (title) {
      case 'Job Postings':
        navigate('/employer/jobs')
        break
      case 'Applications':
        navigate('/employer/applicants')
        break
      case 'Analytics':
        navigate('/employer/analytics')
        break
      default:
        showNotification(dispatch, `Clicked ${title} card`, 'info')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Employer Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your job postings and track applications
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/employer/create-job')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Create New Job
          </button>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            Loading dashboard data...
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Job Postings"
            description="Create and manage job listings"
            icon={<Briefcase />}
            onClick={handleCardClick}
          />
          <DashboardCard
            title="Applications"
            description="Review and manage applications"
            icon={<Users />}
            onClick={handleCardClick}
          />
          <DashboardCard
            title="Analytics"
            description="Track job posting performance"
            icon={<LineChart />}
            onClick={handleCardClick}
          />
        </div>
      </Suspense>
    </div>
  )
}

function DashboardCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: (title: string) => void
}) {
  return (
    <div
      className="p-6 rounded-lg border border-border
        bg-card text-card-foreground shadow-sm hover:shadow-md transition-all
        cursor-pointer group"
      onClick={() => onClick(title)}
    >
      <div className="flex items-start space-x-4">
        <div
          className="flex-shrink-0 p-2 rounded-lg bg-accent text-accent-foreground
          group-hover:bg-accent/80 dark:group-hover:bg-accent/80 transition-colors"
        >
          {icon}
        </div>
        <div>
          <h2
            className="text-xl font-semibold mb-2 text-card-foreground group-hover:text-primary
            transition-colors"
          >
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}