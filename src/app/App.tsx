import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { TwoLevelSidebar } from './components/SidebarDemo';
import { TooltipProvider } from './components/ui/tooltip';
import { HomeDashboard } from './components/HomeDashboard';
import { DataLakeReport } from './components/DataLakeReport';
import { SharingSummary } from './components/SharingSummary';
import { DataDashboard } from './components/DataDashboard';
import { QueryHistory } from './components/QueryHistory';
import { SavedQueries } from './components/SavedQueries';
import { DB } from './components/DB';
import { CollectionEditor } from './components/ingestor/CollectionEditor';
import { ExploreEntry, type EntryInitial } from './components/explore/ExploreEntry';
import { buildExploreFromSaved } from './components/explore/mock/mockLibrary';
import { QueryTool } from './components/explore/query/QueryTool';
import { StructureExplorer } from './components/explore/structure/StructureExplorer';
import { addDerived } from './components/explore/derivedStore';
import type { ExploreQuery } from './components/explore/types';
import { ShareWizard } from './components/sharing/ShareWizard';
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
  report: 'Report',
  audit: 'Audit',
  usermanager: 'User Management',
  settings: 'General Configuration',
};

// Default sub-items for each main section
const DEFAULT_SUB_ITEMS: Record<string, string> = {
  dashboard: 'Home',
  querytool: 'Saved Queries',
  ingestor: 'Collections',
  datamanager: 'Projects & Studies',
  report: 'Data Lake Report',
  audit: 'Operation Logs',
  usermanager: 'User Management',
  settings: 'General Configuration',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState('Home');
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);
  const [openExplore, setOpenExplore] = useState<EntryInitial | null>(null);
  const [derivedFlow, setDerivedFlow] = useState(false);
  const [structureQuery, setStructureQuery] = useState<ExploreQuery | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  // da dove è stato aperto Explore, per tornarci all'uscita
  const [exploreOrigin, setExploreOrigin] = useState<{ tab: string; sub: string }>({ tab: 'querytool', sub: 'Saved Queries' });

  const handleSectionChange = (section: string) => {
    setActiveTab(section);
    setActiveSubItem(DEFAULT_SUB_ITEMS[section] || '');
  };

  const handleSubItemClick = (label: string) => {
    if (activeTab === 'querytool' && label === 'Explore') {
      setExploreOrigin({ tab: 'querytool', sub: 'Saved Queries' });
      setActiveSubItem('Explore');
      setOpenExplore({ kind: 'chooser' });
      return;
    }
    setActiveSubItem(label);
  };

  // Apertura della chat Explore da Saved Queries / History (popolata da un seed)
  const openExploreFrom = (kind: 'sq' | 'h', q: { id: string; prompt: string; databases: string[]; title: string }) => {
    const id = `${kind}-${q.id}`;
    setExploreOrigin({ tab: 'querytool', sub: kind === 'sq' ? 'Saved Queries' : 'History' });
    setOpenExplore({ kind: 'chat', app: { mode: 'workspace', id, seed: buildExploreFromSaved(id, { prompt: q.prompt, databases: q.databases, title: q.title }) } });
  };

  const navigate = (tab: string, sub?: string) => {
    setActiveTab(tab);
    setActiveSubItem(sub ?? DEFAULT_SUB_ITEMS[tab] ?? '');
  };

  // Crea una collezione derivata dalla query e torna alla lista Collections
  const handleCreateDerived = (q: ExploreQuery) => {
    addDerived({ name: q.title, sourceCollections: q.collections, prompt: q.prompt, sql: q.sql, rowCount: q.rowCount, results: q.results, execMs: q.execMs });
    setDerivedFlow(false);
    navigate('ingestor', 'Collections');
  };

  const openExploreHome = () => {
    setExploreOrigin({ tab: 'dashboard', sub: 'Home' });
    setOpenExplore({ kind: 'chooser' });
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <HomeDashboard
          onCreateCollection={() => setOpenCollectionId(`new-${Date.now()}`)}
          onExplore={openExploreHome}
          onOpenCollection={setOpenCollectionId}
          onNavigate={navigate}
          onShare={() => setShareOpen(true)}
        />
      );
    }
    if (activeTab === 'report') {
      switch (activeSubItem) {
        case 'Data Lake Report': return <DataLakeReport />;
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
        case 'Collections': return <DB onOpenCollection={setOpenCollectionId} onNewDerived={() => setDerivedFlow(true)} onExploreDerived={setStructureQuery} />;
        case 'Connectors': return <Connectors />;
        case 'File Uploader': return <FileUploader />;
        default: return <DB onOpenCollection={setOpenCollectionId} onNewDerived={() => setDerivedFlow(true)} onExploreDerived={setStructureQuery} />;
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
        case 'Sharing Summary': return <SharingSummary onShare={() => setShareOpen(true)} />;
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

  // Full-screen Explore (chooser 3 modalità: chat / query assistite / data explorer) — bypasses sidebar + topbar
  if (openExplore) {
    return (
      <ExploreEntry
        initial={openExplore}
        onExit={() => { setOpenExplore(null); setActiveTab(exploreOrigin.tab); setActiveSubItem(exploreOrigin.sub); }}
      />
    );
  }

  // Full-screen: creazione collezione derivata (Query Tool in modalità derived)
  if (derivedFlow) {
    return <QueryTool derived onBack={() => setDerivedFlow(false)} onCreateDerived={handleCreateDerived} />;
  }

  // Full-screen: esplorazione grafica di una query (lineage + anteprima righe)
  if (structureQuery) {
    return (
      <StructureExplorer
        request={{ mode: 'query', queryId: structureQuery.id }}
        query={structureQuery}
        onClose={() => setStructureQuery(null)}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen app-backdrop text-zinc-900 font-sans overflow-hidden">
        <div className="theme-sidebar-wrapper h-full shrink-0">
          <TwoLevelSidebar
            activeSection={activeTab}
            onSectionChange={handleSectionChange}
            onSubItemClick={handleSubItemClick}
            activeSubItem={activeSubItem}
          />
        </div>

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar currentTabLabel={currentLabel} onNavigate={navigate} />

          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>

        <ShareWizard open={shareOpen} onOpenChange={setShareOpen} onDone={() => navigate('audit', 'Sharing Summary')} />
      </div>
    </TooltipProvider>
  );
}