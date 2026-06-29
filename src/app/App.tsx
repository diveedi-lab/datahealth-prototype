import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { TwoLevelSidebar } from './components/SidebarDemo';
import { DataLakeReport } from './components/DataLakeReport';
import { SharingSummary } from './components/SharingSummary';
import { DataDashboard } from './components/DataDashboard';
import { QueryHistory } from './components/QueryHistory';
import { SavedQueries } from './components/SavedQueries';
import { DB } from './components/DB';
import { CollectionEditor } from './components/ingestor/CollectionEditor';
import { ExploreWorkspace } from './components/explore/ExploreWorkspace';
import { buildExploreFromSaved } from './components/explore/mock/mockLibrary';
import type { ExploreState } from './components/explore/types';
import { Connectors } from './components/Connectors';
import { FileUploader } from './components/FileUploader';
import { ProjectsStudies } from './components/dm/ProjectsStudies';
import { Entities } from './components/dm/Entities';
import { Variables } from './components/dm/Variables';
import { Laboratory } from './components/dm/Laboratory';
import { Biobank } from './components/dm/Biobank';
import { OperationLogs } from './components/audit/OperationLogs';
import { AccessLogs } from './components/audit/AccessLogs';
import { SecurityAlerts } from './components/audit/SecurityAlerts';
import { UserManagement } from './components/um/UserManagement';
import { RolesPermissions } from './components/um/RolesPermissions';
import { GeneralConfig } from './components/settings/GeneralConfig';
import { NotificationSettings } from './components/settings/NotificationSettings';
import { DataStandards } from './components/settings/DataStandards';
import { ApiKeys } from './components/settings/ApiKeys';
import { MyProfile } from './components/settings/MyProfile';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  querytool: 'Query Tool',
  ingestor: 'Collections',
  datamanager: 'Data Manager',
  audit: 'Audit',
  usermanager: 'User Management',
  settings: 'General Configuration',
};

// Default sub-items for each main section
const DEFAULT_SUB_ITEMS: Record<string, string> = {
  dashboard: 'Data Lake Report',
  querytool: 'Saved Queries',
  ingestor: 'Collections',
  datamanager: 'Projects & Studies',
  audit: 'Operation Logs',
  usermanager: 'User Management',
  settings: 'General Configuration',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState('Data Lake Report');
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);
  const [openExploration, setOpenExploration] = useState<{ id: string; seed?: ExploreState } | null>(null);

  const handleSectionChange = (section: string) => {
    setActiveTab(section);
    setActiveSubItem(DEFAULT_SUB_ITEMS[section] || '');
  };

  const handleSubItemClick = (label: string) => {
    if (activeTab === 'querytool' && label === 'Explore') {
      setActiveSubItem('Explore');
      setOpenExploration({ id: 'main' });
      return;
    }
    setActiveSubItem(label);
  };

  // Apertura del workspace Explore da Saved Queries / History (popolato da un seed)
  const openExploreFrom = (kind: 'sq' | 'h', q: { id: string; prompt: string; databases: string[]; title: string }) => {
    const id = `${kind}-${q.id}`;
    setOpenExploration({ id, seed: buildExploreFromSaved(id, { prompt: q.prompt, databases: q.databases, title: q.title }) });
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      switch (activeSubItem) {
        case 'Data Lake Report': return <DataLakeReport />;
        case 'Sharing Summary': return <SharingSummary />;
        case 'Data Dashboard': return <DataDashboard />;
        default: return <DataLakeReport />;
      }
    }
    if (activeTab === 'querytool') {
      switch (activeSubItem) {
        case 'Saved Queries': return <SavedQueries onOpen={(q) => openExploreFrom('sq', q)} />;
        case 'History': return <QueryHistory onOpen={(q) => openExploreFrom('h', q)} />;
        default: return <SavedQueries onOpen={(q) => openExploreFrom('sq', q)} />;
      }
    }
    if (activeTab === 'ingestor') {
      switch (activeSubItem) {
        case 'Collections': return <DB onOpenCollection={setOpenCollectionId} />;
        case 'Connectors': return <Connectors />;
        case 'File Uploader': return <FileUploader />;
        default: return <DB onOpenCollection={setOpenCollectionId} />;
      }
    }
    if (activeTab === 'datamanager') {
      switch (activeSubItem) {
        case 'Projects & Studies': return <ProjectsStudies />;
        case 'Entities': return <Entities />;
        case 'Variables': return <Variables />;
        case 'Laboratory': return <Laboratory />;
        case 'Biobank': return <Biobank />;
        default: return <ProjectsStudies />;
      }
    }
    if (activeTab === 'audit') {
      switch (activeSubItem) {
        case 'Operation Logs': return <OperationLogs />;
        case 'Access Logs': return <AccessLogs />;
        case 'Security Alerts': return <SecurityAlerts />;
        default: return <OperationLogs />;
      }
    }
    if (activeTab === 'usermanager') {
      switch (activeSubItem) {
        case 'User Management': return <UserManagement />;
        case 'Roles & Permissions': return <RolesPermissions />;
        default: return <UserManagement />;
      }
    }
    if (activeTab === 'settings') {
      switch (activeSubItem) {
        case 'General Configuration': return <GeneralConfig />;
        case 'Notifications': return <NotificationSettings />;
        case 'Data Standards': return <DataStandards />;
        case 'API Keys': return <ApiKeys />;
        case 'My Profile': return <MyProfile />;
        default: return <GeneralConfig />;
      }
    }
    return (
      <div className="w-full h-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-400">
        <p className="text-lg font-medium mb-2">Content Area</p>
        <p className="text-sm">Section currently empty for: <strong className="text-zinc-500">{TAB_LABELS[activeTab] || activeTab}</strong></p>
      </div>
    );
  };

  const currentLabel = activeSubItem || TAB_LABELS[activeTab] || 'Data Area';

  // Full-screen Collection editor (n8n-style canvas) — bypasses sidebar + topbar
  if (openCollectionId) {
    return (
      <CollectionEditor
        collectionId={openCollectionId}
        onClose={() => setOpenCollectionId(null)}
      />
    );
  }

  // Full-screen Explore workspace (query/esplorazione chat-driven) — bypasses sidebar + topbar
  if (openExploration) {
    return (
      <ExploreWorkspace
        explorationId={openExploration.id}
        seed={openExploration.seed}
        onClose={() => { setOpenExploration(null); setActiveSubItem('Saved Queries'); }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-white text-zinc-900 font-sans overflow-hidden">
      <div className="theme-sidebar-wrapper h-full shrink-0">
        <TwoLevelSidebar
          activeSection={activeTab}
          onSectionChange={handleSectionChange}
          onSubItemClick={handleSubItemClick}
          activeSubItem={activeSubItem}
        />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50/50">
        <TopBar currentTabLabel={currentLabel} />

        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}