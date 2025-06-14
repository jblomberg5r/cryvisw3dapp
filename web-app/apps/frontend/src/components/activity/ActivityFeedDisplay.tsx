import React from 'react';
import { useActivityStore } from '../../store/activityStore';
import { ActivityLog } from '../../types/activity';
import {
  List, ListItem, ListItemIcon, ListItemText, Typography, Paper, Box, Tooltip,
  Accordion, AccordionSummary, AccordionDetails, IconButton, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Import all MUI icons that might be used, or use a dynamic import strategy if many
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DataObjectIcon from '@mui/icons-material/DataObject';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SpeedIcon from '@mui/icons-material/Speed';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ExtensionIcon from '@mui/icons-material/Extension';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History'; // Default icon

// Map string icon names to actual MUI components
const iconMap: { [key: string]: React.ElementType } = {
  AddCircleOutline: AddCircleOutlineIcon,
  Edit: EditIcon,
  Delete: DeleteIcon,
  CreateNewFolder: CreateNewFolderIcon,
  DeleteForever: DeleteForeverIcon,
  InsertDriveFile: InsertDriveFileIcon,
  DriveFileRenameOutline: DriveFileRenameOutlineIcon,
  DeleteOutline: DeleteOutlineIcon,
  OpenInNew: OpenInNewIcon,
  DataObject: DataObjectIcon,
  RocketLaunch: RocketLaunchIcon,
  SettingsEthernet: SettingsEthernetIcon,
  CheckCircleOutline: CheckCircleOutlineIcon,
  ErrorOutline: ErrorOutlineIcon,
  Speed: SpeedIcon,
  PlayCircleOutline: PlayCircleOutlineIcon,
  ReportProblem: ReportProblemIcon,
  DeleteSweep: DeleteSweepIcon,
  Extension: ExtensionIcon,
  Link: LinkIcon,
  LinkOff: LinkOffIcon,
  SyncAlt: SyncAltIcon,
  WarningAmber: WarningAmberIcon,
  Info: InfoIcon,
  History: HistoryIcon, // Default
};


const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000; // years
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000; // months
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400; // days
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600; // hours
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60; // minutes
  if (interval > 1) return Math.floor(interval) + "m ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + "s ago";
};

interface ActivityFeedDisplayProps {
  maxItems?: number;
}

const ActivityFeedDisplay: React.FC<ActivityFeedDisplayProps> = ({ maxItems = 50 }) => {
  const { activityLogs, clearLogs } = useActivityStore();

  if (activityLogs.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', mt: 2 }}>
        <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb:1 }}/>
        <Typography variant="h6" color="text.secondary">No recent activity.</Typography>
        <Typography variant="body2" color="text.secondary">Perform some actions in the app to see them logged here.</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ mt: 2}}>
       <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', p:1.5, borderBottom: '1px solid #eee'}}>
        <Typography variant="h6" >Activity Feed</Typography>
        <Button size="small" onClick={clearLogs} disabled={activityLogs.length === 0}>
            Clear All Logs
        </Button>
      </Box>
      <List dense sx={{ maxHeight: 400, overflowY: 'auto', p:0 }}>
        {activityLogs.slice(0, maxItems).map((log) => {
          const IconComponent = log.icon ? iconMap[log.icon] || HistoryIcon : HistoryIcon;
          return (
            <ListItem key={log.id} divider sx={{py: 1, alignItems: 'flex-start'}}>
              <ListItemIcon sx={{mt: 0.5, minWidth: 36}}>
                <Tooltip title={log.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}>
                    <IconComponent fontSize="small" />
                </Tooltip>
              </ListItemIcon>
              <ListItemText
                primary={log.message}
                secondary={
                  <>
                    <Typography component="span" variant="caption" color="text.secondary">
                      {formatTimeAgo(log.timestamp)}
                    </Typography>
                    {log.details && Object.keys(log.details).length > 0 && (
                       <Accordion elevation={0} disableGutters sx={{ '&.MuiAccordion-root:before': { display: 'none' }, bgcolor: 'transparent', p:0, m:0, mt:0.5 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{fontSize: '1rem'}}/>} sx={{minHeight: '24px!important', p:0, '& .MuiAccordionSummary-content': {m:0, alignItems:'center'} }}>
                                <Typography variant="caption" sx={{fontStyle: 'italic', color:'text.disabled'}}>Toggle details</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{p:1, pt:0, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius:1}}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.75rem' }}>
                                    {JSON.stringify(log.details, null, 2)}
                                </pre>
                            </AccordionDetails>
                        </Accordion>
                    )}
                  </>
                }
                primaryTypographyProps={{variant: 'body2'}}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default ActivityFeedDisplay;
