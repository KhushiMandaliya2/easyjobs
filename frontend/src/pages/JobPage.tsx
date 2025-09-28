import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { JobApplicationForm } from '@/features/applications/components/JobApplicationForm';
import { JobApplicationsList } from '@/features/applications/components/JobApplicationsList';

export function JobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!jobId) {
    return <div>Job not found</div>;
  }

  const handleApplicationSuccess = () => {
    // Force a refresh of the applications list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Apply for this Job</h1>
        <JobApplicationForm 
          jobId={parseInt(jobId)} 
          onSuccess={handleApplicationSuccess} 
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <JobApplicationsList 
          key={refreshKey} 
          jobId={parseInt(jobId)}
          showMyApplications={true}
        />
      </div>
    </div>
  );
}