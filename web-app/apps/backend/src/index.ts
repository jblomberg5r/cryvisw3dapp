import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import session from 'express-session'; // Added for Passport session
import configuredPassport, { generateJwtForUser, getFrontendCallbackUrl } from './auth/google.auth.service'; // Renamed import
import { authService } from './auth/auth.service';
import { RequestOtpDto, VerifyOtpDto } from './auth/dto/auth.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { ethers } from 'ethers'; // Moved this import to the top
// Import your services if you want to use them in routes
// import { getLatestBlock } from './services/alchemyService';
// import { getWalletPortfolio } from './services/zerionService';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Middleware to parse JSON bodies

// Session middleware for Passport. Required for OAuth callback and session management.
// In a stateless JWT-only app, session might be set to { session: false } in passport.authenticate,
// but Google strategy often relies on session during the OAuth dance.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'yourDefaultSessionSecret', // Should be in .env
    resave: false,
    saveUninitialized: false, // true might be needed for some OAuth flows if session is not established before redirect
    cookie: { secure: process.env.NODE_ENV === 'production' }, // Use secure cookies in production
  })
);

// Initialize Passport and restore authentication state, if any, from the session.
app.use(configuredPassport.initialize());
app.use(configuredPassport.session());


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// Sample API endpoint
app.get('/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Backend!' });
});

// Auth routes
app.post('/auth/email/request-otp', async (req: Request, res: Response) => {
  const requestOtpDto = plainToClass(RequestOtpDto, req.body);
  const errors = await validate(requestOtpDto);

  if (errors.length > 0) {
    return res.status(400).json({ errors: errors.map(err => Object.values(err.constraints)).flat() });
  }

  try {
    await authService.requestOtp(requestOtpDto.email);
    return res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return res.status(500).json({ message: 'Error requesting OTP.' });
  }
});

app.post('/auth/email/verify-otp', async (req: Request, res: Response) => {
  const verifyOtpDto = plainToClass(VerifyOtpDto, req.body);
  const errors = await validate(verifyOtpDto);

  if (errors.length > 0) {
    return res.status(400).json({ errors: errors.map(err => Object.values(err.constraints)).flat() });
  }

  try {
    const token = await authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    if (token) {
      return res.status(200).json({ token });
    } else {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Error verifying OTP.' });
  }
});

// --- Wallet Authentication Routes ---
import { generateChallenge, verifySignatureAndLogin } from './auth/wallet.auth.service';

app.post('/auth/wallet/request-challenge', (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ message: 'walletAddress is required and must be a string.' });
  }
  try {
    // Validate wallet address format (basic validation)
    if (!ethers.utils.isAddress(walletAddress)) {
        return res.status(400).json({ message: 'Invalid wallet address format.' });
    }
    const challenge = generateChallenge(walletAddress);
    return res.status(200).json({ challenge });
  } catch (error: any) {
    // Catch potential errors from ethers.utils.isAddress if format is extremely malformed,
    // though it usually returns false for typical non-addresses.
    console.error('Error requesting challenge:', error);
    return res.status(500).json({ message: error.message || 'Error generating challenge.' });
  }
});

app.post('/auth/wallet/verify-signature', async (req: Request, res: Response) => {
  const { walletAddress, originalChallenge, signature } = req.body;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ message: 'walletAddress is required.' });
  }
  if (!originalChallenge || typeof originalChallenge !== 'string') {
    return res.status(400).json({ message: 'originalChallenge is required.' });
  }
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ message: 'signature is required.' });
  }

  try {
    // It's good practice to ensure walletAddress is checksummed before use,
    // though verifySignatureAndLogin service already does it.
    const normalizedAddress = ethers.utils.getAddress(walletAddress);

    const result = await verifySignatureAndLogin(normalizedAddress, originalChallenge, signature);
    if (result) {
      return res.status(200).json({ token: result.token, userId: result.user.id, walletAddress: result.user.walletAddress });
    } else {
      return res.status(401).json({ message: 'Signature verification failed or challenge invalid/expired.' });
    }
  } catch (error: any) {
    console.error('Error verifying signature:', error);
    // Check if error is due to invalid address format from getAddress
    if (error.code === 'INVALID_ARGUMENT' && error.argument === 'address') {
        return res.status(400).json({ message: 'Invalid wallet address format provided.'});
    }
    return res.status(500).json({ message: error.message || 'Error verifying signature.' });
  }
});


// --- Google OAuth Routes ---

// Step 1: Redirect to Google's OAuth consent screen
// The 'google' string here refers to the name of the strategy registered with Passport.
app.get('/auth/google', configuredPassport.authenticate('google', { scope: ['profile', 'email'] }));

// Step 2: Google redirects back to this URL after user authentication
// This route handles the callback from Google.
app.get(
  '/auth/google/callback',
  configuredPassport.authenticate('google', {
    // failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`, // Redirect on failure
    session: false // We will issue a JWT, so we don't need to establish a server session beyond the OAuth handshake
  }),
  (req: Request, res: Response) => {
    // Passport authentication was successful. `req.user` contains the authenticated user (from `done(null, user)` in strategy).
    if (!req.user) {
      // This case should ideally be handled by failureRedirect, but as a fallback:
      console.error('Google auth callback: req.user is undefined after authentication.');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed_no_user`);
    }

    const user = req.user as any; // Type assertion based on your User interface in google.auth.service
    try {
      const appToken = generateJwtForUser(user);
      const frontendRedirectUrl = getFrontendCallbackUrl(appToken);
      console.log(`Google auth successful for ${user.email}. Redirecting to: ${frontendRedirectUrl}`);
      res.redirect(frontendRedirectUrl);
    } catch (error) {
      console.error('Error generating JWT or redirecting after Google auth:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=jwt_generation_failed`);
    }
  }
);

// Example using Alchemy service (uncomment and adapt as needed)
/*
app.get('/latest-block', async (req: Request, res: Response) => {
  try {
    // const block = await getLatestBlock();
    // res.json({ latestBlock: block });
    res.json({ message: "Alchemy latest-block endpoint placeholder" });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest block' });
  }
});
*/

// Example using Zerion service (uncomment and adapt as needed)
/*
app.get('/portfolio/:address', async (req: Request, res: Response) => {
  try {
    // const portfolio = await getWalletPortfolio(req.params.address);
    // res.json(portfolio);
    res.json({ message: 'Zerion portfolio endpoint placeholder for ' + req.params.address });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio from Zerion' });
  }
});
*/

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`Google OAuth: Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL (e.g., http://localhost:${port}/api/auth/google/callback if backend is at /api) are correctly set in your environment variables or .env file.`);
  console.log(`Google OAuth Callback URL for setup in Google Cloud Console should be the full public URL for /auth/google/callback, e.g., YOUR_APP_DOMAIN/api/auth/google/callback`);
  console.log(`Wallet Auth: Endpoints /auth/wallet/request-challenge and /auth/wallet/verify-signature are active.`);
});
