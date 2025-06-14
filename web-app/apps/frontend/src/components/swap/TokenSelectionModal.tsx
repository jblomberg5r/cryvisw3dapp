import React, { useState, useMemo } from 'react';
import { TokenInfo } from '../../types/swap';
import { useSwapStore } from '../../store/swapStore'; // To get mockTokens
import {
  Dialog, DialogTitle, DialogContent, List, ListItemButton, ListItemAvatar,
  Avatar, ListItemText, TextField, InputAdornment, Box, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin'; // Default icon

interface TokenSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectToken: (token: TokenInfo) => void;
  title?: string;
  excludeTokenSymbol?: string; // To prevent selecting the same token for both from and to
}

const TokenSelectionModal: React.FC<TokenSelectionModalProps> = ({
  open,
  onClose,
  onSelectToken,
  title = "Select Token",
  excludeTokenSymbol
}) => {
  const { mockTokens } = useSwapStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = useMemo(() => {
    let tokens = mockTokens;
    if (excludeTokenSymbol) {
      tokens = tokens.filter(token => token.symbol !== excludeTokenSymbol);
    }
    if (!searchTerm.trim()) {
      return tokens;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return tokens.filter(token =>
      token.name.toLowerCase().includes(lowerSearchTerm) ||
      token.symbol.toLowerCase().includes(lowerSearchTerm) ||
      token.address.toLowerCase().includes(lowerSearchTerm)
    );
  }, [mockTokens, searchTerm, excludeTokenSymbol]);

  const handleTokenSelect = (token: TokenInfo) => {
    onSelectToken(token);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{sx: {height: '80vh'}}}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{display: 'flex', flexDirection: 'column'}}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, symbol, or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, flexShrink: 0 }}
        />
        {filteredTokens.length === 0 ? (
            <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Typography color="text.secondary">No tokens found.</Typography>
            </Box>
        ) : (
            <List sx={{overflowY: 'auto', flexGrow: 1}}>
            {filteredTokens.map((token) => (
                <ListItemButton key={token.address} onClick={() => handleTokenSelect(token)}>
                <ListItemAvatar>
                    <Avatar src={token.logoURI} alt={token.symbol}>
                    {!token.logoURI && <CurrencyBitcoinIcon />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={token.symbol}
                    secondary={token.name}
                    primaryTypographyProps={{fontWeight: 'medium'}}
                />
                </ListItemButton>
            ))}
            </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelectionModal;
