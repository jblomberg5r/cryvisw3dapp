import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Ensure API key is loaded from .env

const ZERION_API_BASE_URL = 'https://api.zerion.io/v1'; // Or the correct base URL from docs
const ZERION_API_KEY = process.env.ZERION_API_KEY;

const zerionApiClient = axios.create({
  baseURL: ZERION_API_BASE_URL,
  headers: {
    'Authorization': \`Basic \${ZERION_API_KEY}\`, // Or 'Bearer' or other scheme as per Zerion docs for API key
    'Content-Type': 'application/json',
  }
});

// Example function to get wallet portfolio
// Replace 'wallet_address' with the actual address parameter
export const getWalletPortfolio = async (address: string) => {
  try {
    // Adjust the endpoint and parameters based on actual Zerion API documentation
    // e.g. /wallets/{address}/portfolio or /portfolio?wallet_address={address}
    const response = await zerionApiClient.get(\`/wallets/\${address}/portfolio\`, {
      // params: { currency: 'usd' } // Example parameters
    });
    console.log(\`Portfolio for \${address}:\`, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching wallet portfolio from Zerion:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching wallet portfolio:', error);
    }
    throw error;
  }
};

// Example function to get list of wallet's fungible positions
export const getWalletFungibles = async (address: string) => {
  try {
    const response = await zerionApiClient.get(\`/wallets/\${address}/positions\`, {
      params: {
        // 'filter[position_types]': 'fungible', // Example filter if API supports it
        'currency': 'usd',
        'sort': '-value' // Example sorting
      }
    });
    console.log(\`Fungibles for \${address}:\`, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching wallet fungibles from Zerion:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching wallet fungibles:', error);
    }
    throw error;
  }
};

// Add more functions as needed based on the API documentation and project requirements
// e.g., getWalletTransactions, getNFTs, etc.

// Remember to expose these functions through your API routes in src/index.ts
// For example:
// import { getWalletPortfolio } from './services/zerionService';
// app.get('/portfolio/:address', async (req, res) => {
//   try {
//     const portfolio = await getWalletPortfolio(req.params.address);
//     res.json(portfolio);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch portfolio from Zerion' });
//   }
// });
