import React, { useState } from 'react';
import { useFunctionTemplateStore } from '../../store/functionTemplateStore';
import { FunctionTemplate, TemplateCategories, TemplateCategory } from '../../types/smartcontract';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Box,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface FunctionTemplateBrowserProps {
  onTemplateSelect: (codeSnippet: string) => void;
  onClose?: () => void; // Optional: if used in a dialog/drawer
}

const FunctionTemplateBrowser: React.FC<FunctionTemplateBrowserProps> = ({ onTemplateSelect, onClose }) => {
  const { getTemplatesByCategory } = useFunctionTemplateStore();
  const [expandedCategory, setExpandedCategory] = useState<TemplateCategory | false>(false);

  const handleAccordionChange = (category: TemplateCategory) =>
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedCategory(isExpanded ? category : false);
  };

  return (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ p: 1}}>
        Function Templates
      </Typography>
      <Divider sx={{mb:1}}/>
      {TemplateCategories.map((category) => {
        const templatesInCategory = getTemplatesByCategory(category);
        if (templatesInCategory.length === 0) return null;

        return (
          <Accordion
            key={category}
            expanded={expandedCategory === category}
            onChange={handleAccordionChange(category)}
            TransitionProps={{ unmountOnExit: true }} // For performance
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${category}-content`}
              id={`${category}-header`}
            >
              <Typography sx={{ flexShrink: 0, fontWeight: 'medium' }}>{category}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense disablePadding>
                {templatesInCategory.map((template) => (
                  <ListItem
                    key={template.id}
                    secondaryAction={
                      <Tooltip title="Insert Snippet">
                        <IconButton
                          edge="end"
                          aria-label="insert template"
                          onClick={() => {
                            onTemplateSelect(template.codeSnippet);
                            if (onClose) onClose(); // Close browser if in a dialog
                          }}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    }
                    disablePadding
                  >
                    <ListItemButton sx={{py: 0.5}}>
                      <ListItemText
                        primary={template.name}
                        secondary={
                          <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" component="span">
                              {template.description}
                            </Typography>
                            {template.parameters.length > 0 && (
                              <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                                <Typography variant="caption" component="span" sx={{fontWeight: 'medium'}}>Params: </Typography>
                                {template.parameters.map((param, index) => (
                                  <Chip
                                    key={index}
                                    label={`${param.name}: ${param.type}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'subtitle2' }}
                      />
                       <Tooltip title={template.description} placement="top">
                         <InfoOutlinedIcon color="action" sx={{fontSize: '1rem', ml:1, opacity: 0.7}}/>
                       </Tooltip>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default FunctionTemplateBrowser;
