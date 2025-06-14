import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleAuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Processing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const authError = queryParams.get('error'); // Check for error from backend redirect

    if (authError) {
      setError(`Authentication failed: ${authError.replace(/_/g, ' ')}.`);
      setMessage(''); // Clear processing message
      // Optionally, redirect to login after a delay
      setTimeout(() => navigate('/login'), 5000);
      return;
    }

    if (token) {
      localStorage.setItem('authToken', token);
      setMessage('Authentication successful! Redirecting to dashboard...');
      // Perform the redirect after a short delay to allow message to be seen (optional)
      setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
    } else {
      setError('Authentication failed: No token received.');
      setMessage('');
      // Optionally, redirect to login after a delay
      setTimeout(() => navigate('/login'), 5000);
    }
  }, [location, navigate]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '500px', margin: '50px auto' }}>
      <h1>Google Authentication Callback</h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!message && !error && <p>Verifying your login details...</p>}
      {error && <p>You will be redirected to the login page shortly.</p>}
    </div>
  );
};

export default GoogleAuthCallbackPage;
