import React from 'react';
import { MarketplaceTemplate } from '../../types/marketplace';
import { Card, CardContent, Typography, CardActions, Button, Chip, Box, Rating, Tooltip } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category'; // Placeholder, ideally use specific icons per category
import CodeIcon from '@mui/icons-material/Code';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People'; // For usage count

interface TemplateCardProps {
  template: MarketplaceTemplate;
  onViewDetails: (templateId: string) => void;
  // onUseTemplate: (templateId: string) => void; // If direct use from card is needed
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onViewDetails }) => {
  return (
    <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
        }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Optional Icon */}
        {/* {template.iconUrl ? <img src={template.iconUrl} alt={template.name} style={{width: 40, height: 40, marginBottom: 10}} /> : <CategoryIcon sx={{mb:1, fontSize: '2rem'}}/>} */}

        <Typography variant="h6" component="div" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
           <CodeIcon sx={{mr: 1, color: 'primary.main'}}/> {template.name}
        </Typography>

        <Chip label={template.category} size="small" color="primary" variant="outlined" sx={{ mb: 1.5 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, height: 60, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
          {template.description}
        </Typography>

        {template.author && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Author: {template.author} {template.version && `(v${template.version})`}
          </Typography>
        )}

        {template.tags && template.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {template.tags.slice(0, 3).map((tag) => ( // Show max 3 tags
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{fontSize: '0.7rem'}}/>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
            {template.rating !== undefined && (
                <Tooltip title={`Rating: ${template.rating.toFixed(1)}/5`}>
                    <Box sx={{display: 'flex', alignItems: 'center', mr: 1.5}}>
                        <StarIcon fontSize="small" sx={{ color: 'warning.main', mr: 0.2 }}/>
                        <Typography variant="body2" color="text.secondary">{template.rating.toFixed(1)}</Typography>
                    </Box>
                </Tooltip>
            )}
            {template.usageCount !== undefined && (
                 <Tooltip title={`Used ${template.usageCount} times`}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <PeopleIcon fontSize="small" sx={{ color: 'info.main', mr: 0.2 }}/>
                        <Typography variant="body2" color="text.secondary">{template.usageCount}</Typography>
                    </Box>
                </Tooltip>
            )}
        </Box>

      </CardContent>
      <CardActions sx={{ borderTop: '1px solid #eee', p:1.5, justifyContent: 'flex-end' }}>
        <Button size="small" variant="outlined" onClick={() => onViewDetails(template.id)}>
          View Details
        </Button>
        {/* <Button size="small" variant="contained" onClick={() => onUseTemplate(template.id)}>Use Template</Button> */}
      </CardActions>
    </Card>
  );
};

export default TemplateCard;
