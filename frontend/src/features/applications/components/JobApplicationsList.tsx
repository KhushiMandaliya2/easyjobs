import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLoadingState } from '@/hooks/useLoadingState';
import { getJobApplications, updateApplicationStatus } from '../api/applications';
import { JobApplication, ApplicationStatus } from '@/types/application';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobApplicationsListProps {
  jobId: number;
}

export function JobApplicationsList({ jobId }: JobApplicationsListProps) {
  const { toast } = useToast();
  const { isLoading, error, startLoading, stopLoading } = useLoadingState();
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    try {
      startLoading();
      const data = await getJobApplications(jobId);
      setApplications(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load applications.',
        variant: 'destructive',
      });
    } finally {
      stopLoading();
    }
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: ApplicationStatus) => {
    try {
      startLoading();
      await updateApplicationStatus(applicationId, { status: newStatus });
      await loadApplications(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Application status updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      });
    } finally {
      stopLoading();
    }
  };

  if (isLoading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Applications</h2>
      {applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant ID</TableHead>
              <TableHead>Cover Letter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.applicant?.username || application.applicant_id}</TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate">{application.cover_letter}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    application.status === ApplicationStatus.PENDING
                      ? 'bg-yellow-100 text-yellow-800'
                      : application.status === ApplicationStatus.UNDER_REVIEW
                      ? 'bg-blue-100 text-blue-800'
                      : application.status === ApplicationStatus.ACCEPTED
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {application.status}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(application.created_at), 'PPP')}</TableCell>
                <TableCell>
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Resume
                  </a>
                </TableCell>
                <TableCell>
                  {application.status === ApplicationStatus.PENDING && (
                    <>
                      <Button
                        onClick={() =>
                          handleStatusUpdate(
                            application.id,
                            ApplicationStatus.UNDER_REVIEW
                          )
                        }
                        variant="secondary"
                        className="mr-2"
                      >
                        Review
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusUpdate(application.id, ApplicationStatus.REJECTED)
                        }
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {application.status === ApplicationStatus.UNDER_REVIEW && (
                    <>
                      <Button
                        onClick={() =>
                          handleStatusUpdate(application.id, ApplicationStatus.ACCEPTED)
                        }
                        variant="default"
                        className="mr-2"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusUpdate(application.id, ApplicationStatus.REJECTED)
                        }
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}