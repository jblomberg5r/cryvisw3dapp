import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// --- Environment Variables ---
// Ensure these are set in your .env file for a real application
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET_PLACEHOLDER';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'; // Assuming backend is at /api
const JWT_SECRET = process.env.JWT_SECRET || 'yourFallbackSecretKey';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Default Vite frontend URL

if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER' || GOOGLE_CLIENT_SECRET === 'YOUR_GOOGLE_CLIENT_SECRET_PLACEHOLDER') {
  console.warn(
    'Google OAuth credentials are not set. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.'
  );
}

// --- Mock User Store and User Type ---
// In a real application, this would interact with a database.
interface User {
  id: string; // App-specific user ID
  googleId?: string;
  email: string;
  displayName?: string;
  // other fields as needed
}

// Simple in-memory store for demonstration
const users: User[] = [];
let nextUserId = 1;

const findOrCreateUserByGoogleId = async (profile: any): Promise<User> => {
  const googleId = profile.id;
  const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

  if (!email) {
    throw new Error('Email not provided by Google profile.');
  }

  let user = users.find(u => u.googleId === googleId);
  if (user) {
    console.log(`User found by googleId: ${user.email}`);
    return user;
  }

  // Optional: Check if a user with this email already exists (e.g., signed up via OTP)
  let existingEmailUser = users.find(u => u.email === email);
  if (existingEmailUser) {
    // Strategy: Link Google ID to existing user or throw error/inform user
    // For now, we'll just log and use this user, adding the googleId
    console.log(`User found by email ${email}, linking googleId ${googleId}.`);
    existingEmailUser.googleId = googleId;
    // Potentially update display name if not set
    if (!existingEmailUser.displayName && profile.displayName) {
        existingEmailUser.displayName = profile.displayName;
    }
    return existingEmailUser;
  }

  // Create new user
  user = {
    id: (nextUserId++).toString(),
    googleId,
    email,
    displayName: profile.displayName || email.split('@')[0],
  };
  users.push(user);
  console.log(`New user created: ${user.email} with googleId ${user.googleId}`);
  return user;
};

// --- Passport Google OAuth 2.0 Strategy Configuration ---
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'], // Ensure 'email' scope is requested
    },
    async (accessToken, refreshToken, profile, done) => {
      // This callback is called after Google successfully authenticates the user.
      // `profile` contains the user's Google profile information.
      try {
        console.log('Google profile received:', JSON.stringify(profile, null, 2));
        const user = await findOrCreateUserByGoogleId(profile);
        // Pass the user object to be available in the request (req.user)
        // In a pure token-based flow (no session), this `done` call's user object
        // is primarily for the current request processing within the callback handler.
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// --- JWT Generation ---
export const generateJwtForUser = (user: User): string => {
  const payload = {
    sub: user.id, // Subject: your application's user ID
    email: user.email,
    googleId: user.googleId,
    name: user.displayName,
    // Add other claims as needed
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Same expiry as OTP JWT
};

// --- Redirection URL ---
export const getFrontendCallbackUrl = (token: string): string => {
  return `${FRONTEND_URL}/auth/google/callback?token=${token}`;
};

// Note: Passport typically uses serializeUser and deserializeUser for session management.
// If you're using sessions with Passport (e.g., app.use(session(...)), app.use(passport.session())),
// you'd need to implement these:
// passport.serializeUser((user, done) => done(null, (user as User).id));
// passport.deserializeUser(async (id, done) => {
//   const user = users.find(u => u.id === id); // Replace with DB lookup
//   done(null, user || false);
// });
// However, for a pure JWT-based approach where the callback immediately issues a token
// and redirects, and subsequent requests are authenticated by the JWT,
// session-based user serialization might not be strictly necessary if `session: false` is used in routes.
// For simplicity in this Express setup without explicit session:false, we'll include minimal serializers.

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  // In a real app, fetch user from DB by id
  const user = users.find(u => u.id === id);
  done(null, user || false);
});

export default passport; // Export configured passport instance
