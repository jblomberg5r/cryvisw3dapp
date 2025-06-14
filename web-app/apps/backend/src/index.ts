import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

// Import your services if you want to use them in routes
// import { getLatestBlock } from './services/alchemyService';
// import { getWalletPortfolio } from './services/zerionService';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// Sample API endpoint
app.get('/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Backend!' });
});

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
  console.log('[server]: Server is running at http://localhost:' + port);
});
