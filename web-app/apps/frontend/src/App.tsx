import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initWeb3Modal } from './config/web3modalConfig'; // Import init function
import { useWeb3ModalAccount, useWeb3ModalProvider, useWeb3ModalState } from '@web3modal/ethers/react';
import { useWalletStore } from './store/walletStore';
import { useNetworkStore } from './store/networkStore';
import { logActivity } from './store/activityStore'; // Import logActivity
import { BrowserProvider, Eip1193Provider } from 'ethers';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TokenCreatorPage from './pages/TokenCreatorPage';
import MarketplacePage from './pages/MarketplacePage';
import AnalyticsPage from './pages/AnalyticsPage';
import DeFiPage from './pages/DeFiPage';
import PurchaseCryptoPage from './pages/PurchaseCryptoPage';
import SwapTokensPage from './pages/SwapTokensPage';
import StakingPage from './pages/StakingPage';
import PortfolioPage from './pages/PortfolioPage'; // Import PortfolioPage
import TaxCalculatorPage from './pages/TaxCalculatorPage'; // Import TaxCalculatorPage

// Initialize Web3Modal
initWeb3Modal();

const App: React.FC = () => {
  const { setWalletData, resetWallet, address: currentAddress, chainId: currentChainId } = useWalletStore();
  const { setSelectedNetworkId: setAppNetworkId, availableNetworks, selectedNetwork } = useNetworkStore();

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    if (isConnected && address && chainId) {
      if (address !== currentAddress || chainId !== currentChainId) {
        logActivity('WALLET_CONNECTED', `Wallet connected: ${address.substring(0,6)}... on chain ID ${chainId}.`, { address, chainId }, 'Link');
      }

      let ethersProvider;
      if (walletProvider) {
        ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider, chainId);
        ethersProvider.getSigner().then(signer => {
            setWalletData({ address, chainId, isConnected: true, provider: ethersProvider, signer });
        }).catch(err => {
            console.error("Error getting signer:", err);
            setWalletData({ address, chainId, isConnected: true, provider: ethersProvider, signer: null });
        });
      } else {
         setWalletData({ address, chainId, isConnected: true, provider: null, signer: null });
      }

      const walletNetwork = availableNetworks.find(net => net.chainId === chainId);
      if (walletNetwork) {
        if (selectedNetwork?.id !== walletNetwork.id) { // Only log if app's selected network changes
            logActivity('NETWORK_SWITCHED', `Wallet network changed to ${walletNetwork.name}. Application network synchronized.`, { networkId: walletNetwork.id, chainId }, 'SyncAlt');
        }
        setAppNetworkId(walletNetwork.id);
      } else {
        setAppNetworkId(null);
        logActivity('WARNING', `Wallet connected to an unsupported network (Chain ID: ${chainId}).`, { chainId }, 'WarningAmber');
        console.warn(`Wallet connected to an unsupported network (Chain ID: ${chainId})`);
      }

    } else {
      if (currentAddress) { // Log only if there was a connected address before
        logActivity('WALLET_DISCONNECTED', `Wallet disconnected.`, { lastAddress: currentAddress }, 'LinkOff');
      }
      resetWallet();
    }
  }, [isConnected, address, chainId, walletProvider, setWalletData, resetWallet, setAppNetworkId, availableNetworks, currentAddress, currentChainId, selectedNetwork]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage />} />
          <Route path="/token-creator" element={<TokenCreatorPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/defi" element={<DeFiPage />} />
          <Route path="/defi/purchase" element={<PurchaseCryptoPage />} />
          <Route path="/defi/swap" element={<SwapTokensPage />} />
          <Route path="/defi/staking" element={<StakingPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} /> {/* Add Portfolio route */}
          <Route path="/tax-calculator" element={<TaxCalculatorPage />} /> {/* Add Tax Calculator route */}
          {/* Add other routes here as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
