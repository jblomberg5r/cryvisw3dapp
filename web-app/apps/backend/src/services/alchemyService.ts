import { Network, Alchemy } from 'alchemy-sdk';
import dotenv from 'dotenv';

dotenv.config(); // Ensure API key is loaded from .env

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key
  network: Network.ETH_MAINNET, // Replace with your network
};

const alchemy = new Alchemy(settings);

// Example function to get the latest block
export const getLatestBlock = async () => {
  try {
    const latestBlock = await alchemy.core.getBlockNumber();
    console.log('The latest block number is', latestBlock);
    return latestBlock;
  } catch (error) {
    console.error('Error fetching latest block:', error);
    throw error;
  }
};

// Example function to get NFTs for an owner
export const getNftsForOwner = async (ownerAddress: string) => {
  try {
    const nfts = await alchemy.nft.getNftsForOwner(ownerAddress);
    console.log('NFTs for ' + ownerAddress + ':', nfts);
    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs for owner:', error);
    throw error;
  }
};

// Add more functions as needed, e.g., for token balances, transaction history, etc.

// You might want to expose these functions through your API routes
// For example, in src/index.ts:
// import { getLatestBlock } from './services/alchemyService';
// app.get('/latest-block', async (req, res) => {
//   try {
//     const block = await getLatestBlock();
//     res.json({ latestBlock: block });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch latest block' });
//   }
// });
