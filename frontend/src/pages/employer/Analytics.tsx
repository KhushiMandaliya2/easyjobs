import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { addDays, format, subDays } from 'date-fns'
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface JobAnalytics {
  job_title: string
  total_applications: number
  status_counts: {
    pending: number
    under_review: number
    interview_scheduled: number
    interview_completed: number
    offer_extended: number
    offer_accepted: number
    offer_declined: number
    rejected: number
  }
}

interface TimelineData {
  date: string
  applications: number
}

export default function Analytics() {
  const { toast } = useToast()
  const [analyticsData, setAnalyticsData] = useState<JobAnalytics[]>([])
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchAnalytics()
    fetchTimelineData()
  }, [startDate, endDate])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/employer`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch analytics data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTimelineData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/analytics/employer/timeline?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch timeline data')
      }

      const data = await response.json()
      setTimelineData(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch timeline data',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        Loading analytics...
      </div>
    )
  }

  const totalApplications = analyticsData.reduce(
    (sum, job) => sum + job.total_applications,
    0
  )

  const applicationStatusData = analyticsData.map(job => ({
    name: job.job_title,
    pending: job.status_counts.pending,
    'under review': job.status_counts.under_review,
    'interview scheduled': job.status_counts.interview_scheduled,
    'interview completed': job.status_counts.interview_completed,
    'offer extended': job.status_counts.offer_extended,
    'offer accepted': job.status_counts.offer_accepted,
  }))

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Job Analytics Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Track your job postings and application metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Applications Timeline</CardTitle>
          <div className="flex gap-4 items-center mt-4">
            <div className="grid gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#4ade80"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Application Status by Job</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" fill="#fbbf24" stackId="a" />
                <Bar dataKey="under review" fill="#60a5fa" stackId="a" />
                <Bar dataKey="interview scheduled" fill="#34d399" stackId="a" />
                <Bar dataKey="interview completed" fill="#818cf8" stackId="a" />
                <Bar dataKey="offer extended" fill="#f472b6" stackId="a" />
                <Bar dataKey="offer accepted" fill="#4ade80" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}