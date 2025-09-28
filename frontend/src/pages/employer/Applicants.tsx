import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getJobsByEmployer } from '@/features/jobs/api/jobs';
import { Job } from '@/types/job';
import { JobApplicationsList } from '@/features/applications/components/JobApplicationsList';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function EmployerApplicants() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await getJobsByEmployer();
      setJobs(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load jobs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Job Applications</h1>
        <p className="text-muted-foreground">Review applications for all your job postings</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {jobs.map((job) => (
            <AccordionItem key={job.id} value={job.id.toString()} className="bg-card rounded-lg border">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {job.company_name} • Posted {format(new Date(job.created_at), 'PPP')}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-4 pb-6">
                <JobApplicationsList jobId={job.id} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}