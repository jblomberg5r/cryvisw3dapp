import { ethers } from 'ethers';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'yourFallbackSecretKey';
const CHALLENGE_EXPIRY_DURATION = 5 * 60 * 1000; // 5 minutes

// --- Challenge Store ---
interface ChallengeStoreEntry {
  challenge: string;
  walletAddress: string;
  expiresAt: number;
}
// Simple in-memory store for demonstration
const challengeStore: Map<string, ChallengeStoreEntry> = new Map(); // Key: walletAddress

// --- Mock User Store and User Type (similar to google.auth.service) ---
interface User {
  id: string; // App-specific user ID
  walletAddress: string;
  // other fields like displayName, email (if collected separately)
}
const users: User[] = []; // In-memory user store
let nextUserId = 1; // Counter for user IDs, assuming google.auth.service might use the same 'users' array if merged. For safety, manage separately or ensure no clashes.
                    // To avoid clashes with users from google.auth.service.ts if they share the same 'users' array and 'nextUserId',
                    // it's better to either namespace IDs, use UUIDs, or have separate user arrays/stores per auth type for this mock setup.
                    // For this example, let's assume 'nextUserId' in this file is independent or this is the only user store.

const findOrCreateUserByWalletAddress = async (walletAddress: string): Promise<User> => {
  const normalizedAddress = ethers.utils.getAddress(walletAddress); // Normalize address
  let user = users.find(u => u.walletAddress === normalizedAddress);
  if (user) {
    console.log(`User found by walletAddress: ${user.walletAddress}`);
    return user;
  }

  user = {
    id: `wallet-${nextUserId++}`, // Prefixing to avoid ID collision with other auth methods if stores were merged
    walletAddress: normalizedAddress,
  };
  users.push(user);
  console.log(`New user created with walletAddress: ${user.walletAddress}`);
  return user;
};

// --- Service Methods ---
export const generateChallenge = (walletAddress: string): string => {
  const normalizedAddress = ethers.utils.getAddress(walletAddress);
  const existingEntry = challengeStore.get(normalizedAddress);
  if (existingEntry && Date.now() < existingEntry.expiresAt) {
    // Return existing, valid challenge to prevent spamming new challenges
    console.log(`Returning existing challenge for ${normalizedAddress}`);
    return existingEntry.challenge;
  }

  const challenge = `Please sign this message to authenticate your wallet: ${crypto.randomBytes(16).toString('hex')} at ${new Date().toISOString()}`;
  const expiresAt = Date.now() + CHALLENGE_EXPIRY_DURATION;
  challengeStore.set(normalizedAddress, { challenge, walletAddress: normalizedAddress, expiresAt });
  console.log(`Generated new challenge for ${normalizedAddress}: "${challenge}"`);
  return challenge;
};

export const verifySignatureAndLogin = async (
  walletAddress: string,
  originalChallenge: string,
  signature: string
): Promise<{ token: string; user: User } | null> => {
  const normalizedAddress = ethers.utils.getAddress(walletAddress);
  const storedEntry = challengeStore.get(normalizedAddress);

  if (!storedEntry) {
    console.warn(`No challenge found for wallet address: ${normalizedAddress}`);
    return null; // Or throw error: 'Challenge not found or expired.'
  }

  if (Date.now() > storedEntry.expiresAt) {
    console.warn(`Challenge expired for wallet address: ${normalizedAddress}`);
    challengeStore.delete(normalizedAddress); // Clean up expired challenge
    return null; // Or throw error: 'Challenge expired.'
  }

  if (storedEntry.challenge !== originalChallenge) {
    console.warn(`Challenge mismatch for wallet address: ${normalizedAddress}. Expected: "${storedEntry.challenge}", Got: "${originalChallenge}"`);
    return null; // Or throw error: 'Challenge mismatch.'
  }

  try {
    const recoveredAddress = ethers.utils.verifyMessage(originalChallenge, signature);
    if (ethers.utils.getAddress(recoveredAddress) === normalizedAddress) {
      // Signature is valid
      console.log(`Signature verified for wallet address: ${normalizedAddress}`);
      challengeStore.delete(normalizedAddress); // Challenge used, remove from store

      const user = await findOrCreateUserByWalletAddress(normalizedAddress);

      const payload = {
        sub: user.id,
        walletAddress: user.walletAddress,
        // Add other claims as needed, e.g., type: 'wallet_auth'
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      return { token, user };
    } else {
      console.warn(`Signature verification failed. Recovered address ${recoveredAddress} does not match expected ${normalizedAddress}`);
      return null; // Or throw error: 'Signature verification failed.'
    }
  } catch (error) {
    console.error('Error during signature verification:', error);
    return null; // Or throw specific errors based on verification error
  }
};

// Helper to clean up expired challenges periodically (optional)
setInterval(() => {
  const now = Date.now();
  for (const [address, entry] of challengeStore.entries()) {
    if (now > entry.expiresAt) {
      challengeStore.delete(address);
      console.log(`Expired challenge removed for ${address}`);
    }
  }
}, CHALLENGE_EXPIRY_DURATION); // Run cleanup every 5 minutes
