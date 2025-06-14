import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, Alert, Modal, Link } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useWalletStore } from '../store/walletStore'; // To get connected wallet address

// Placeholder style for the widget area
const widgetAreaStyle = {
  border: '2px dashed #ccc',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  minHeight: '400px', // Typical height for these widgets
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f9f9f9',
  mt: 3,
  mb: 3,
};

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const PurchaseCryptoPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address: walletAddress, isConnected } = useWalletStore();

  const handleLaunchWidget = () => {
    // In a real implementation, this would initialize and show the on-ramp widget.
    // For example, using MoonPay SDK:
    // const moonPaySdk = MoonPayWebSdk.init({
    //   flow: 'buy',
    //   environment: 'sandbox', // or 'production'
    //   variant: 'overlay', // or 'embedded'
    //   params: {
    //     apiKey: 'YOUR_MOONPAY_API_KEY', // Store securely, preferably via backend
    //     walletAddress: walletAddress || undefined, // Pre-fill if connected
    //     defaultCurrencyCode: 'ETH',
    //     // ... other params
    //   }
    // });
    // moonPaySdk.show();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <MonetizationOnIcon color="primary" sx={{ fontSize: 50 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 1 }}>
            Purchase Cryptocurrency
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          This feature allows you to buy cryptocurrencies using fiat currency (e.g., USD, EUR) through a secure third-party service.
          You will be redirected or shown a widget provided by services like{' '}
          <Link href="https://www.moonpay.com/" target="_blank" rel="noopener">MoonPay</Link>,{' '}
          <Link href="https://transak.com/" target="_blank" rel="noopener">Transak</Link>, or others.
        </Alert>

        <Typography variant="body1" paragraph color="text.secondary">
          When you proceed, the chosen on-ramp provider will handle the transaction process. Please ensure you understand their terms, fees, and KYC (Know Your Customer) requirements.
        </Typography>

        {/* Placeholder for On-Ramp Widget Integration */}
        {/*
          TODO: Integrate On-Ramp Service SDK/Widget Here
          1. Choose a provider (e.g., MoonPay, Transak, Ramp Network).
          2. Obtain an API key from the provider and store it securely (ideally via a backend proxy, or as an environment variable for client-side SDKs if they support it directly).
          3. Follow their SDK documentation to embed or launch their widget.
             - Pass the connected `walletAddress` to pre-fill the destination for purchased crypto.
             - Configure default currencies, amounts, etc., as needed.
          Example (conceptual):
          <div id="onramp-widget-container" style={widgetAreaStyle}>
             Widget will load here if using an embedded approach.
          </div>
        */}
        <Box sx={widgetAreaStyle}>
          <Typography variant="h6" color="text.secondary">
            Fiat-to-Crypto On-Ramp Widget Area
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mt:1}}>
            (Actual third-party widget will be embedded or launched from here)
          </Typography>
        </Box>

        {isConnected && walletAddress && (
            <Typography variant="caption" display="block" sx={{textAlign: 'center', mb:2, color: 'text.secondary'}}>
                Your connected wallet address for receiving funds: <strong>{walletAddress}</strong>
            </Typography>
        )}
        {!isConnected && (
            <Alert severity="warning" sx={{textAlign: 'center', mb:2}}>
                Please connect your wallet. The purchased crypto will be sent to your connected address.
            </Alert>
        )}


        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleLaunchWidget}
            // disabled={!isConnected} // Optionally disable if wallet not connected
          >
            Launch Purchase Widget
          </Button>
        </Box>
      </Paper>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="placeholder-modal-title"
        aria-describedby="placeholder-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="placeholder-modal-title" variant="h6" component="h2">
            On-Ramp Widget Placeholder
          </Typography>
          <Typography id="placeholder-modal-description" sx={{ mt: 2 }}>
            This is a placeholder for the actual fiat-to-crypto on-ramp widget.
            In a real application, integrating a service like MoonPay or Transak would display their interface here, allowing you to purchase crypto.
            Ensure you have an API key and follow the provider's SDK integration guide.
            {walletAddress && ` Your connected wallet address (${walletAddress.substring(0,6)}...) would typically be pre-filled.`}
          </Typography>
          <Button onClick={handleCloseModal} sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default PurchaseCryptoPage;
