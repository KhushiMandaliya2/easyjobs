import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface JobFormData {
  title: string
  company_name: string
  location: string
  description: string
  requirements: string
  salary_min?: number
  salary_max?: number
  employment_type: string
  status: string
}

const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'contract',
  'internship',
  'temporary'
]

const STATUS_TYPES = [
  'active',
  'closed',
  'draft'
]

export default function EditJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company_name: '',
    location: '',
    description: '',
    requirements: '',
    employment_type: '',
    status: ''
  })

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
        setFormData(data)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update job')
      }

      toast({
        title: 'Success',
        description: 'Job updated successfully',
      })
      navigate(`/employer/jobs/${id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update job',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof JobFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        Loading job details...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Job Posting</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary_min">Minimum Salary (Optional)</Label>
              <Input
                id="salary_min"
                type="number"
                value={formData.salary_min || ''}
                onChange={(e) => handleChange('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div>
              <Label htmlFor="salary_max">Maximum Salary (Optional)</Label>
              <Input
                id="salary_max"
                type="number"
                value={formData.salary_max || ''}
                onChange={(e) => handleChange('salary_max', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div>
            <Label>Employment Type</Label>
            <Select
              value={formData.employment_type}
              onValueChange={(value) => handleChange('employment_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/employer/jobs/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}