import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLoadingState } from '@/hooks/useLoadingState';
import { applyForJob } from '../api/applications';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { JobApplicationCreate } from '@/types/application';

interface JobApplicationFormProps {
  jobId: number;
  onSuccess?: () => void;
}

export function JobApplicationForm({ jobId, onSuccess }: JobApplicationFormProps) {
  const { toast } = useToast();
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    onSuccess?.();
    // Navigate to my-applications page after successful submission
    navigate('/my-applications');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Resume URL is required.',
        variant: 'destructive',
      });
      return;
    }

    const applicationData: JobApplicationCreate = {
      job_id: jobId,
      cover_letter: coverLetter.trim(),
      resume_url: resumeUrl.trim(),
    };

    try {
      startLoading();
      await applyForJob(applicationData);
      toast({
        title: 'Success',
        description: 'Your application has been submitted successfully.',
      });
      setCoverLetter('');
      setResumeUrl('');
      handleSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="resumeUrl" className="block text-sm font-medium">
          Resume URL
        </label>
        <Input
          id="resumeUrl"
          type="url"
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          placeholder="https://example.com/my-resume.pdf"
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium">
          Cover Letter
        </label>
        <Textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Tell us why you're interested in this position..."
          required
          className="mt-1 h-32"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
}