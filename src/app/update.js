const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components/SidebarDemo.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /function getSidebarContent\([\s\S]*?return contentMap\[activeSection\] \|\| contentMap\.tasks;\n\}/;

const newFunction = `function getSidebarContent(
  activeSection: string,
): SidebarContent {
  const contentMap: Record<string, SidebarContent> = {
    dashboard: {
      title: "Dashboard",
      sections: [
        {
          title: "Dashboard Types",
          items: [
            { icon: <View size={16} className="text-neutral-50" />, label: "Overview", isActive: true },
            { icon: <Dashboard size={16} className="text-neutral-50" />, label: "Executive Summary" },
          ],
        },
      ],
    },
    querytool: {
      title: "QueryTool",
      sections: [
        {
          title: "Queries",
          items: [
            { icon: <Search size={16} className="text-neutral-50" />, label: "New Query" },
            { icon: <Report size={16} className="text-neutral-50" />, label: "Saved Queries" },
            { icon: <Time size={16} className="text-neutral-50" />, label: "Query History" },
          ],
        },
      ],
    },
    ingestor: {
      title: "Ingestor",
      sections: [
        {
          title: "Data Pipeline",
          items: [
            { icon: <CloudUpload size={16} className="text-neutral-50" />, label: "Upload Data" },
            { icon: <Renew size={16} className="text-neutral-50" />, label: "Sync Status" },
            { icon: <Settings size={16} className="text-neutral-50" />, label: "Connectors" },
          ],
        },
      ],
    },
    database: {
      title: "Database",
      sections: [
        {
          title: "Storage",
          items: [
            { icon: <Archive size={16} className="text-neutral-50" />, label: "Schemas" },
            { icon: <Folder size={16} className="text-neutral-50" />, label: "Tables" },
            { icon: <Analytics size={16} className="text-neutral-50" />, label: "Metrics" },
          ],
        },
      ],
    },
    datamanager: {
      title: "Data Manager",
      sections: [
        {
          title: "Management",
          items: [
            { icon: <FolderOpen size={16} className="text-neutral-50" />, label: "Projects" },
            { icon: <Task size={16} className="text-neutral-50" />, label: "Tasks" },
            { icon: <View size={16} className="text-neutral-50" />, label: "Data Quality" },
          ],
        },
      ],
    },
    audit: {
      title: "Audit",
      sections: [
        {
          title: "Logs",
          items: [
            { icon: <Report size={16} className="text-neutral-50" />, label: "System Logs" },
            { icon: <Security size={16} className="text-neutral-50" />, label: "Access Logs" },
            { icon: <Flag size={16} className="text-neutral-50" />, label: "Alerts" },
          ],
        },
      ],
    },
    usermanager: {
      title: "User Manager",
      sections: [
        {
          title: "Users & Groups",
          items: [
            { icon: <UserMultiple size={16} className="text-neutral-50" />, label: "Users" },
            { icon: <Group size={16} className="text-neutral-50" />, label: "Groups" },
            { icon: <Security size={16} className="text-neutral-50" />, label: "Roles & Permissions" },
          ],
        },
      ],
    },
    settings: {
      title: "Settings",
      sections: [
        {
          title: "Account",
          items: [
            { icon: <User size={16} className="text-neutral-50" />, label: "Profile settings" },
            { icon: <Security size={16} className="text-neutral-50" />, label: "Security" },
            { icon: <Notification size={16} className="text-neutral-50" />, label: "Notifications" },
          ],
        },
      ],
    },
  };

  return contentMap[activeSection] || contentMap.dashboard;
}`;

content = content.replace(regex, newFunction);
fs.writeFileSync(file, content);
console.log('Done!');