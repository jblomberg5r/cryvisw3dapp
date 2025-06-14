import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useFileTreeStore } from '../store/fileTreeStore';
import {
  Container, Typography, Box, Paper, Grid, Divider,
  Button, Drawer, Tabs, Tab
} from '@mui/material';
import FileExplorer from '../components/fileexplorer/FileExplorer';
import VersionControlActions from '../components/versioncontrol/VersionControlActions';
import CodeEditor, { CodeEditorRef } from '../components/editor/CodeEditor';
import FunctionTemplateBrowser from '../components/smartcontract/FunctionTemplateBrowser';
import ContractTestRunner from '../components/smartcontract/ContractTestRunner';
import TestResultsDisplay from '../components/smartcontract/TestResultsDisplay';
import NetworkSelector from '../components/network/NetworkSelector';
import GasEstimator from '../components/network/GasEstimator';      // Import GasEstimator
import Deployer from '../components/network/Deployer';            // Import Deployer
import DeploymentStatusDisplay from '../components/network/DeploymentStatusDisplay'; // Import DeploymentStatusDisplay
import { useThemeContext } from '../components/Layout';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import { useDeploymentStore } from '../store/deploymentStore'; // Import deployment store
import ScienceIcon from '@mui/icons-material/Science'; // Icon for Testing Tab
import CodeIcon from '@mui/icons-material/Code'; // Icon for Code Tab

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  sx?: object; // Allow sx prop
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, sx, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-detail-tabpanel-${index}`}
      aria-labelledby={`project-detail-tab-${index}`}
      {...other}
      style={{ height: 'calc(100% - 48px)', ...sx }} // Adjust 48px based on Tab height
    >
      {value === index && (
        <Box sx={{ height: '100%', overflowY: 'auto' }}>{children}</Box>
      )}
    </div>
  );
}

const ProjectDetailPage: React.FC = () => {
  const codeEditorRef = useRef<CodeEditorRef>(null);
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0); // 0 for Code, 1 for Testing

  const { projectId } = useParams<{ projectId: string }>();
  const { projects, fetchProjects } = useProjectStore((state) => ({
    projects: state.projects,
    fetchProjects: state.fetchProjects,
  }));
  const {
    setSelectedProject,
    currentOpenFileId,
    currentOpenFileContent,
    updateOpenFileContent,
    currentFileTree,
    // No need for openFile here directly, interaction is via FileExplorer
  } = useFileTreeStore(); // Simplified store access

  const {
    estimateGas,
    clearAllDeployments: clearProjectDeployments // Alias to avoid conflict
  } = useDeploymentStore();
  const { selectedNetworkId } = useNetworkStore();

  const project = projects.find(p => p.id === projectId);
  const { mode: themeMode } = useThemeContext();

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects, fetchProjects]);

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
      setCurrentTab(0);
      clearProjectDeployments(); // Clear deployments when project changes
    }
  }, [projectId, setSelectedProject, clearProjectDeployments]);

  // Effect to trigger gas estimation for contract file
  useEffect(() => {
    if (currentTab === 0 && currentOpenFileContent && currentOpenFileId && selectedNetworkId && getFileLanguage(currentOpenFileId) === 'solidity') {
      estimateGas(currentOpenFileContent, selectedNetworkId);
    }
  }, [currentTab, currentOpenFileContent, currentOpenFileId, selectedNetworkId, estimateGas]);

  const getFileLanguage = (fileId: string | null): string => {
    if (!fileId) return 'text';
    const findNodeRecursive = (nodes: any[], id: string): any | null => {
      for (const node of nodes) {
        if (node.id === id && node.type === 'file') return node;
        if (node.children) {
          const found = findNodeRecursive(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    const fileNode = findNodeRecursive(currentFileTree, fileId);
    if (fileNode?.language) return fileNode.language;
    if (fileNode?.name) {
        const extension = fileNode.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'js': return 'javascript';
            case 'ts': return 'typescript';
            case 'sol': return 'solidity';
            case 'json': return 'json';
            case 'md': return 'markdown';
            default: return 'text';
        }
    }
    return 'text';
  };

  const editorMode = getFileLanguage(currentOpenFileId);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (!project) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 3 }}>Project not found.</Typography>
      </Container>
    );
  }

  // Calculate available height for Grid container (FileExplorer + Editor/Testing Area)
  // This assumes AppBar height of 64px and Project Header (name, desc, actions) ~100-120px
  // Adjust these values based on your actual layout.
  const headerAndPaddingHeight = themeMode === 'dark' ? 180 : 170; // Approximate height
  const availableHeightForGrid = `calc(100vh - ${headerAndPaddingHeight}px)`;


  return (
    <Container maxWidth={false} sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', mt: 2, p: '0 !important' }}>
      {/* Project Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>{project.name}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {project.description || 'No description for this project.'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <VersionControlActions />
          <Button
            variant="outlined"
            startIcon={<AddToPhotosIcon />}
            onClick={() => setIsTemplateBrowserOpen(true)}
            disabled={currentTab !== 0} // Disable if not on Code tab
          >
            Insert Template
          </Button>
        </Box>
        <Divider sx={{ mb:0 }}/>
      </Box>

      {/* Main Content Grid (File Explorer + Editor/Testing Area) */}
      <Grid container spacing={0} sx={{ flexGrow: 1, overflow: 'hidden', pl: 2, pr: 2, pb: 2, height: availableHeightForGrid }}>
        {/* File Explorer */}
        <Grid item xs={12} sm={4} md={3} lg={2.5} sx={{
          borderRight: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
          height: '100%',
          overflowY: 'auto'
        }}>
          <FileExplorer projectId={project.id} />
        </Grid>

        {/* Editor/Testing Area */}
        <Grid item xs={12} sm={8} md={9} lg={9.5} sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="Code and Testing Tabs">
              <Tab label="Code" icon={<CodeIcon />} iconPosition="start" sx={{minHeight: '48px'}} />
              <Tab label="Testing" icon={<ScienceIcon />} iconPosition="start" sx={{minHeight: '48px'}} />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0} sx={{p:0}}>
            {currentOpenFileId && currentOpenFileContent !== null ? (
              <CodeEditor
                ref={codeEditorRef}
                value={currentOpenFileContent}
                onChange={updateOpenFileContent}
                mode={editorMode}
                theme={themeMode === 'dark' ? 'tomorrow_night' : 'github'}
                width="100%"
                height="100%"
              />
            ) : (
              <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a file to view or edit its content.
                </Typography>
              </Box>
            )}
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <Grid container spacing={2} sx={{height: '100%', p:1}}>
              {/* Left side: Test Runner & Results */}
              <Grid item xs={12} md={7} sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Paper elevation={1} sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                  <ContractTestRunner />
                  <Box sx={{flexGrow:1, overflowY: 'auto'}}>
                    <TestResultsDisplay />
                  </Box>
                </Paper>
              </Grid>
              {/* Right side: Deployment Tools */}
              <Grid item xs={12} md={5} sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Paper elevation={1} sx={{p:2, display: 'flex', flexDirection: 'column', gap: 2}}>
                  <Typography variant="h6">Deployment Tools</Typography>
                  <NetworkSelector />
                  <GasEstimator />
                  <Deployer
                    contractCode={currentOpenFileContent && getFileLanguage(currentOpenFileId) === 'solidity' ? currentOpenFileContent : null}
                    contractName={currentOpenFileId ? currentFileTree.find(f => f.id === currentOpenFileId)?.name.replace('.sol', '') : "MyContract"}
                  />
                </Paper>
                <Box sx={{mt: 2, flexGrow:1, overflowY: 'auto'}}>
                    <DeploymentStatusDisplay />
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={isTemplateBrowserOpen}
        onClose={() => setIsTemplateBrowserOpen(false)}
        PaperProps={{
          sx: { width: { xs: '90%', sm: '60%', md: '50%', lg: '40%' }, maxWidth: '600px', p:0 }
        }}
      >
        <FunctionTemplateBrowser
          onTemplateSelect={(snippet) => {
            if (codeEditorRef.current && currentTab === 0) { // Ensure Code tab is active
              codeEditorRef.current.insertText(snippet);
            }
            // setIsTemplateBrowserOpen(false); // Optionally close after selection
          }}
          onClose={() => setIsTemplateBrowserOpen(false)}
        />
      </Drawer>
    </Container>
  );
};

export default ProjectDetailPage;
