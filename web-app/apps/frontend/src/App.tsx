import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TokenCreatorPage from './pages/TokenCreatorPage';
import MarketplacePage from './pages/MarketplacePage'; // Import MarketplacePage

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage />} />
          <Route path="/token-creator" element={<TokenCreatorPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} /> {/* Add Marketplace route */}
          {/* Add other routes here as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
