import { useState } from 'react';

export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const setErrorMessage = (message: string | null) => setError(message);

  return {
    isLoading,
    startLoading,
    stopLoading,
    error,
    setError: setErrorMessage
  };
}
