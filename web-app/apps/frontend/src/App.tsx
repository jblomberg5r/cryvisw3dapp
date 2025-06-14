import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import EmailOtpLogin from './components/EmailOtpLogin';
import DashboardPage from './pages/DashboardPage';
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage'; // Added
import './App.css';

const HomePage = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/hello') // Proxied request, will go to http://localhost:3001/hello
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
      })
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error("Failed to fetch from backend:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Home Page</h1>
      <p>Welcome to the application!</p>
      <button className="btn btn-primary mt-4">Hello DaisyUI</button>
      <div className="mt-4 p-4 border rounded shadow-md bg-base-200">
        <h2 className="text-xl mb-2">Message from Backend:</h2>
        {error && <p className="text-red-500 font-semibold">Error: {error}</p>}
        {message && <p className="text-green-500 font-semibold">{message}</p>}
        {!message && !error && <p>Loading message from backend...</p>}
      </div>
    </div>
  );
};

const AboutPage = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">About Page</h1>
    <p>This is the about page.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div data-theme="light"> {/* DaisyUI theme */}
        <nav className="navbar bg-base-100 shadow-lg mb-4">
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl">MyApp</a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal p-0">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              {isAuthenticated() ? (
                <>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><button onClick={() => { localStorage.removeItem('authToken'); window.location.pathname = '/login'; }}>Logout</button></li>
                </>
              ) : (
                <li><Link to="/login">Login</Link></li>
              )}
            </ul>
          </div>
        </nav>

        <div className="container mx-auto">
          <Routes>
            <Route path="/login" element={<EmailOtpLogin />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} /> {/* Added route */}
            <Route
              path="/dashboard"
              element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" replace />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/"
              element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
            />
            {/* Default redirect for any other path if needed, or a 404 component */}
            {/* <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Helper function (can be outside or inside App component if preferred)
const isAuthenticated = (): boolean => {
  return localStorage.getItem('authToken') !== null;
};

export default App;
