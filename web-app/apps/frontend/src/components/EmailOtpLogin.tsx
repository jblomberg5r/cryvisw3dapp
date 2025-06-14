import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers'; // For wallet interactions

const EmailOtpLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpRequested, setOtpRequested] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      // Assuming backend is running on port 3001 and accessible via /api proxy
      const response = await fetch('/api/auth/email/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.errors?.join(', ') || 'Failed to request OTP');
      }
      setOtpRequested(true);
      setMessage(data.message || 'OTP sent to your email address.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/auth/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.errors?.join(', ') || 'Failed to verify OTP');
      }
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setMessage('Login successful! Redirecting...');
        navigate('/dashboard');
      } else {
        throw new Error('No token received. Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirects to the backend endpoint that starts the Google OAuth flow
    window.location.href = '/api/auth/google';
  };

  const handleWalletLogin = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask (or another Web3 wallet) is not installed. Please install it to use this feature.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Request account access and get address
      // Using ethers.js v5 provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Prompts user to connect wallet
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

      if (!walletAddress) {
        setError('Could not get wallet address. Please ensure your wallet is connected.');
        setIsLoading(false);
        return;
      }
      setMessage(`Wallet connected: ${walletAddress.substring(0,6)}...${walletAddress.substring(walletAddress.length-4)}`);

      // 2. Request challenge from backend
      setMessage('Requesting challenge...');
      const challengeResponse = await fetch('/api/auth/wallet/request-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const challengeData = await challengeResponse.json();
      if (!challengeResponse.ok || !challengeData.challenge) {
        throw new Error(challengeData.message || 'Failed to get challenge from server.');
      }
      const challenge = challengeData.challenge;
      setMessage('Challenge received. Please sign the message in your wallet.');

      // 3. Prompt user to sign the challenge
      let signature;
      try {
        signature = await signer.signMessage(challenge);
      } catch (signError: any) {
        // Handle user declining signature
        if (signError.code === 4001) { // MetaMask user rejected transaction
             throw new Error('You rejected the signature request. Please try again.');
        }
        throw new Error(signError.message || 'Failed to sign message. Please try again.');
      }

      setMessage('Signature obtained. Verifying with server...');

      // 4. Verify signature with backend
      const verifyResponse = await fetch('/api/auth/wallet/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, originalChallenge: challenge, signature }),
      });
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.token) {
        throw new Error(verifyData.message || 'Wallet login failed. Signature verification error.');
      }

      // 5. Store JWT and redirect
      localStorage.setItem('authToken', verifyData.token);
      setMessage('Login successful! Redirecting to dashboard...');
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during wallet login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {!otpRequested ? (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{textAlign: 'center', marginBottom: '10px'}}>Email OTP Login</h3>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              disabled={isLoading}
            />
          </div>
          <button onClick={handleRequestOtp} disabled={isLoading} style={{ padding: '10px 15px', width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isLoading ? 'Sending OTP...' : 'Request OTP'}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{textAlign: 'center', marginBottom: '10px'}}>Enter OTP</h3>
          <p>An OTP has been sent to {email}. Please enter it below.</p>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="otp" style={{ display: 'block', marginBottom: '5px' }}>OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter your OTP"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              disabled={isLoading}
            />
          </div>
          <button onClick={handleVerifyOtp} disabled={isLoading} style={{ padding: '10px 15px', width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isLoading ? 'Verifying...' : 'Login with OTP'}
          </button>
          <button
            onClick={() => { setOtpRequested(false); setMessage(null); setError(null); setEmail(''); setOtp(''); }}
            disabled={isLoading}
            style={{ marginTop: '10px', width: '100%', background: 'transparent', border: '1px solid #ccc', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back to Email Input
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <h3 style={{marginBottom: '10px'}}>Or</h3>
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{ padding: '10px 15px', width: '100%', backgroundColor: '#db4437', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? 'Redirecting...' : 'Login with Google'}
        </button>
      </div>

      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center' }}>
         <button
          onClick={handleWalletLogin}
          disabled={isLoading}
          style={{ padding: '10px 15px', width: '100%', backgroundColor: '#5098E5', /* WalletConnect blue or similar */ color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? 'Connecting Wallet...' : 'Login with Wallet'}
        </button>
      </div>
    </div>
  );
};

export default EmailOtpLogin;
