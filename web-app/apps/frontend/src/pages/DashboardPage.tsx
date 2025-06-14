import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (!token) {
    return <p>Redirecting to login...</p>; // Or a loading spinner
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome! You are logged in.</p>
      <p>Your token: {token.substring(0, 20)}...</p> {/* Display part of the token for confirmation */}
      <button onClick={handleLogout} style={{ padding: '10px 15px', marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;
