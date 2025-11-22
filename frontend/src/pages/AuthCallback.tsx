import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!token) {
        setError('No authentication token received.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        await authService.handleOAuthCallback(token);
        // Redirect to dashboard after successful OAuth
        navigate('/', { replace: true });
        // Force page reload to update AuthContext
        window.location.reload();
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Failed to complete authentication.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {error ? (
            <>
              <div className="text-red-600 text-xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900">{error}</h2>
              <p className="mt-2 text-sm text-gray-600">Redirecting to login...</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Completing authentication...
              </h2>
              <p className="mt-2 text-sm text-gray-600">Please wait while we log you in.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
