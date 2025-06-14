// web-app/apps/frontend/src/components/network/Deployer.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Deployer from './Deployer';
import { useDeploymentStore } from '../../store/deploymentStore';
import { useNetworkStore } from '../../store/networkStore';
import { useWalletStore } from '../../store/walletStore'; // For isConnected
import { useWeb3ModalAccount, useSwitchNetwork } from '@web3modal/ethers/react'; // For wallet's chainId

// Mock stores and hooks
jest.mock('../../store/deploymentStore');
jest.mock('../../store/networkStore');
jest.mock('../../store/walletStore');
jest.mock('@web3modal/ethers/react', () => ({
  useWeb3ModalAccount: jest.fn(),
  useSwitchNetwork: jest.fn(),
}));

const mockUseDeploymentStore = useDeploymentStore as jest.MockedFunction<typeof useDeploymentStore>;
const mockUseNetworkStore = useNetworkStore as jest.MockedFunction<typeof useNetworkStore>;
const mockUseWalletStore = useWalletStore as jest.MockedFunction<typeof useWalletStore>; // Not directly used by Deployer but good for context
const mockUseWeb3ModalAccount = useWeb3ModalAccount as jest.MockedFunction<typeof useWeb3ModalAccount>;
const mockUseSwitchNetwork = useSwitchNetwork as jest.MockedFunction<typeof useSwitchNetwork>;


describe('Deployer Component', () => {
  const mockDeployContract = jest.fn();
  const mockSwitchNetworkHookFn = jest.fn(() => Promise.resolve());

  const contractCode = "pragma solidity ^0.8.0; contract Test {}";
  const contractName = "TestContract";

  beforeEach(() => {
    mockUseDeploymentStore.mockReturnValue({
      deployContract: mockDeployContract,
      isDeploying: false,
      // other states if needed by Deployer directly
      currentDeployments: [], estimatedGas: null, isEstimatingGas: false,
      estimateGas: jest.fn(), clearAllDeployments: jest.fn(), clearRecentDeployment: jest.fn()
    });
    mockUseNetworkStore.mockReturnValue({
      selectedNetworkId: 'net1',
      selectedNetwork: { id: 'net1', name: 'TestNet1', chainId: 1, isTestnet: true, blockExplorerUrl: 'https://etherscan.io' },
      availableNetworks: [], getNetworkById: jest.fn(), setSelectedNetworkId: jest.fn()
    });
    mockUseWalletStore.mockReturnValue({ // Default connected state
        isConnected: true, address: '0x123', chainId: 1, provider: null, signer: null,
        setWalletData: jest.fn(), resetWallet: jest.fn()
    });
    mockUseWeb3ModalAccount.mockReturnValue({ // Wallet and app network match initially
      address: '0x123', chainId: 1, isConnected: true, isConnecting: false, status: 'connected'
    });
    mockUseSwitchNetwork.mockReturnValue({
      switchNetwork: mockSwitchNetworkHookFn,
      chainId: 1, // Current chainId from the hook's perspective
      error: null,
      isLoading: false,
    });
    mockDeployContract.mockClear();
    mockSwitchNetworkHookFn.mockClear();
  });

  it('renders Deploy button when network matches and conditions are met', () => {
    render(<Deployer contractCode={contractCode} contractName={contractName} />);
    const deployButton = screen.getByRole('button', { name: /Deploy to TestNet1/i });
    expect(deployButton).toBeInTheDocument();
    expect(deployButton).not.toBeDisabled();
  });

  it('calls deployContract when Deploy button is clicked and networks match', () => {
    render(<Deployer contractCode={contractCode} contractName={contractName} />);
    fireEvent.click(screen.getByRole('button', { name: /Deploy to TestNet1/i }));
    expect(mockDeployContract).toHaveBeenCalledWith(contractName, contractCode, 'net1');
  });

  it('shows Switch Network button when wallet network mismatches selected network', () => {
    mockUseWeb3ModalAccount.mockReturnValueOnce({ // Wallet on a different network
      address: '0x123', chainId: 5, isConnected: true, isConnecting: false, status: 'connected'
    });
    render(<Deployer contractCode={contractCode} contractName={contractName} />);
    const switchButton = screen.getByRole('button', { name: /Switch to TestNet1/i });
    expect(switchButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Deploy to TestNet1/i })).not.toBeInTheDocument(); // Deploy button shouldn't be primary
  });

  it('calls switchNetwork when Switch Network button is clicked', () => {
    mockUseWeb3ModalAccount.mockReturnValueOnce({ chainId: 5, isConnected: true } as any); // Mismatch
    const selectedChainId = mockUseNetworkStore().selectedNetwork?.chainId; // Should be 1

    render(<Deployer contractCode={contractCode} contractName={contractName} />);
    fireEvent.click(screen.getByRole('button', { name: /Switch to TestNet1/i }));
    expect(mockSwitchNetworkHookFn).toHaveBeenCalledWith(selectedChainId);
  });

  it('disables Deploy button if no contract code', () => {
    render(<Deployer contractCode={null} contractName={contractName} />);
    expect(screen.getByRole('button', { name: /Deploy to TestNet1/i })).toBeDisabled();
    expect(screen.getByText(/No contract code available/i)).toBeInTheDocument();
  });

  it('disables Deploy button if no network selected', () => {
    mockUseNetworkStore.mockReturnValueOnce({ ...useNetworkStore(), selectedNetworkId: null, selectedNetwork: null } as any);
    render(<Deployer contractCode={contractCode} contractName={contractName} />);
    // The button text changes if selectedNetwork is null
    expect(screen.getByRole('button', { name: /Deploy to selected network/i })).toBeDisabled();
     expect(screen.getByText(/Please select a target network/i)).toBeInTheDocument();
  });

  it('shows "Connect your wallet" alert if not connected', () => {
    mockUseWeb3ModalAccount.mockReturnValueOnce({ isConnected: false } as any);
    render(<Deployer contractCode={contractCode} contractName={contractName} />);
    expect(screen.getByText(/Connect your wallet to enable deployment./i)).toBeInTheDocument();
    // Deploy button might still be rendered but should be disabled implicitly or explicitly
    // The current implementation makes `canDeploy` false, thus disabling it.
    const deployButton = screen.getByRole('button', { name: /Deploy to TestNet1/i });
    expect(deployButton).toBeDisabled();
  });

  // Test for loading states (isDeploying, isSwitchingNetwork) can also be added
});
