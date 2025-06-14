// web-app/apps/frontend/src/pages/TokenCreatorPage.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom'; // For any Link components if used indirectly
import TokenCreatorPage from './TokenCreatorPage';
import { useTokenCreatorStore } from '../store/tokenCreatorStore';
import { useDeploymentStore } from '../store/deploymentStore';
import { useNetworkStore } from '../store/networkStore';

// Mock stores
jest.mock('../store/tokenCreatorStore');
jest.mock('../store/deploymentStore');
jest.mock('../store/networkStore');

// Mock CodeEditor as it's complex and not the focus of this page's unit tests
jest.mock('../components/editor/CodeEditor', () => () => <div data-testid="mock-code-editor">Mock Code Editor</div>);


const mockUseTokenCreatorStore = useTokenCreatorStore as jest.MockedFunction<typeof useTokenCreatorStore>;
const mockUseDeploymentStore = useDeploymentStore as jest.MockedFunction<typeof useDeploymentStore>;
const mockUseNetworkStore = useNetworkStore as jest.MockedFunction<typeof useNetworkStore>;

describe('TokenCreatorPage', () => {
  const mockSetStandard = jest.fn();
  const mockUpdateConfig = jest.fn();
  const mockGenerateCode = jest.fn();
  const mockResetConfig = jest.fn();
  const mockSetGeneratedCode = jest.fn();
  const mockEstimateGas = jest.fn();

  beforeEach(() => {
    mockUseTokenCreatorStore.mockReturnValue({
      tokenConfig: { name: '', symbol: '' },
      selectedStandard: null,
      generatedCode: null,
      isGenerating: false,
      setStandard: mockSetStandard,
      updateConfig: mockUpdateConfig,
      generateCode: mockGenerateCode,
      resetConfig: mockResetConfig,
      setGeneratedCode: mockSetGeneratedCode,
      updateFeature: jest.fn(), // Add missing function
    });
    mockUseDeploymentStore.mockReturnValue({
      estimatedGas: null,
      isEstimatingGas: false,
      isDeploying: false,
      currentDeployments: [],
      estimateGas: mockEstimateGas,
      deployContract: jest.fn(),
      clearAllDeployments: jest.fn(),
      clearRecentDeployment: jest.fn(),
    });
    mockUseNetworkStore.mockReturnValue({
      availableNetworks: [{ id: 'net1', name: 'TestNet1', chainId: 1, isTestnet: true }],
      selectedNetworkId: 'net1',
      selectedNetwork: { id: 'net1', name: 'TestNet1', chainId: 1, isTestnet: true },
      setSelectedNetworkId: jest.fn(),
      getNetworkById: jest.fn(),
    });
  });

  const renderPage = () => render(<BrowserRouter><TokenCreatorPage /></BrowserRouter>);

  it('renders standard selection buttons', () => {
    renderPage();
    expect(screen.getByText('ERC20 (Fungible)')).toBeInTheDocument();
    expect(screen.getByText('ERC721 (NFT)')).toBeInTheDocument();
    expect(screen.getByText('ERC1155 (Multi-Token)')).toBeInTheDocument();
  });

  it('calls setStandard when a standard is selected', () => {
    renderPage();
    fireEvent.click(screen.getByText('ERC20 (Fungible)'));
    expect(mockSetStandard).toHaveBeenCalledWith('ERC20');
  });

  it('shows base config fields when a standard is selected', () => {
    mockUseTokenCreatorStore.mockReturnValueOnce({
      ...useTokenCreatorStore(), // get all default mocks
      selectedStandard: 'ERC20',
      tokenConfig: { standard: 'ERC20', name: '', symbol: '' } // Provide a minimal config
    });
    renderPage();
    expect(screen.getByLabelText(/Token Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Token Symbol/i)).toBeInTheDocument();
  });

  // Example for ERC20 form - similar tests for ERC721, ERC1155
  it('shows ERC20 form when ERC20 standard is selected', () => {
     mockUseTokenCreatorStore.mockReturnValueOnce({
      ...useTokenCreatorStore(),
      selectedStandard: 'ERC20',
      tokenConfig: { standard: 'ERC20', name: 'Test', symbol: 'TST', decimals: 18, initialSupply: "1000" }
    });
    // Mock the specific form to assert it's rendered
    // jest.mock('../components/tokencreator/ERC20Form', () => () => <div data-testid="mock-erc20-form">ERC20 Form</div>);
    // ^ This mock needs to be at top level. For simplicity, we check for a field from ERC20Form.
    renderPage();
    expect(screen.getByLabelText(/Decimals/i)).toBeInTheDocument();
  });

  it('calls generateCode when "Generate Contract Code" is clicked', () => {
    // Mock state to enable the button
    mockUseTokenCreatorStore.mockReturnValueOnce({
      ...useTokenCreatorStore(),
      selectedStandard: 'ERC20',
      tokenConfig: { standard: 'ERC20', name: 'MyToken', symbol: 'MTK', decimals: 18, initialSupply: '10000' }
    });
    renderPage();
    const generateButton = screen.getByText(/Generate Contract Code/i);
    expect(generateButton).not.toBeDisabled();
    fireEvent.click(generateButton);
    expect(mockGenerateCode).toHaveBeenCalled();
  });

  it('displays generated code and deployment tools when code exists', () => {
    mockUseTokenCreatorStore.mockReturnValueOnce({
      ...useTokenCreatorStore(),
      selectedStandard: 'ERC20',
      tokenConfig: { standard: 'ERC20', name: 'MyToken', symbol: 'MTK', decimals: 18, initialSupply: '10000' },
      generatedCode: 'pragma solidity ^0.8.0;',
      isGenerating: false,
    });
    renderPage();
    expect(screen.getByTestId('mock-code-editor')).toBeInTheDocument();
    expect(screen.getByText(/Deployment Tools/i)).toBeInTheDocument(); // From the Divider Chip
    expect(screen.getByText(/Estimated Gas Cost/i)).toBeInTheDocument(); // From GasEstimator
  });

  it('triggers gas estimation when generated code and network are available', () => {
    const initialCode = 'pragma solidity...';
    mockUseTokenCreatorStore.mockReturnValue({
      ...useTokenCreatorStore(),
      selectedStandard: 'ERC20',
      tokenConfig: { standard: 'ERC20', name: 'MyToken', symbol: 'MTK', decimals:18, initialSupply:"1000" },
      generatedCode: initialCode,
      isGenerating: false,
    });
     mockUseNetworkStore.mockReturnValue({
      ...useNetworkStore(),
      selectedNetworkId: 'net1', // Ensure a network is selected
    });

    renderPage(); // Render with initial state

    // useEffect in TokenCreatorPage should call estimateGas
    expect(mockEstimateGas).toHaveBeenCalledWith(initialCode, 'net1');
  });

});
