import { useState } from "react";
import svgPaths from "../imports/svg-svkvdgwod6";
import {
  Search,
  Dashboard,
  Task,
  Folder,
  Calendar,
  UserMultiple,
  Analytics,
  DocumentAdd,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  OverflowMenuHorizontal,
  CheckmarkOutline,
  Time,
  InProgress,
  Pending,
  Archive,
  Flag,
  AddLarge,
  Filter,
  Renew,
  View,
  Report,
  Share,
  CloudUpload,
  Notification,
  Security,
  Integration,
  StarFilled,
  Group,
  Calendar as CalendarIcon,
  Home,
  ChartBar,
  FolderOpen,
  ChevronLeft,
  ChevronUp,
  DataViewAlt,
} from "@carbon/icons-react";

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

import appLogo from 'figma:asset/2a6c34eb1fc4cb17dd82d9cb673a1d0c9d2ed879.png';

function InterfacesLogo1() {
  return (
    <div
      className="aspect-square w-full h-full overflow-clip relative shrink-0 rounded-md"
      data-name="App Logo"
    >
      <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
    </div>
  );
}

function Avatar() {
  return (
    <div
      className="bg-[#000000] relative rounded-[999px] shrink-0 size-8"
      data-name="Avatar"
    >
      <div className="box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative size-8">
        <User size={16} className="text-neutral-50" />
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[999px]"
      />
    </div>
  );
}

function SearchContainer({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
      data-name="Search Container"
    >
      <div
        className={`bg-[#000000] h-10 relative rounded-lg flex items-center transition-all duration-500 ${
          isCollapsed
            ? "w-10 min-w-10 justify-center"
            : "w-full"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div
          className={`flex items-center justify-center shrink-0 transition-all duration-500 ${
            isCollapsed ? "p-1" : "px-1"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="size-8 flex items-center justify-center">
            <Search size={16} className="text-neutral-50" />
          </div>
        </div>
        <div
          className={`flex-1 min-h-px min-w-px relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="flex flex-col justify-center relative size-full">
            <div className="box-border content-stretch flex flex-col gap-2 items-start justify-center pl-0 pr-2 py-1 relative w-full">
              <input
                type="text"
                placeholder="Search tasks, projects..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-['Lexend:Regular',_sans-serif] font-normal text-[14px] text-neutral-50 placeholder:text-neutral-400 leading-[20px]"
                tabIndex={isCollapsed ? -1 : 0}
              />
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-lg"
        />
      </div>
    </div>
  );
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  hasDropdown?: boolean;
  isActive?: boolean;
  children?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarContent {
  title: string;
  sections: MenuSection[];
}

function MenuItem({
  item,
  isExpanded,
  onToggle,
  onItemClick,
  isCollapsed,
}: {
  item: MenuItem;
  isExpanded?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
  isCollapsed?: boolean;
}) {
  const handleClick = () => {
    if (item.hasDropdown && onToggle) {
      onToggle();
    } else if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`select-none rounded-lg cursor-pointer transition-all duration-500 flex items-center relative my-0.5 ${
          item.isActive
            ? "bg-neutral-900"
            : "hover:bg-neutral-900"
        } ${
          isCollapsed
            ? "w-10 min-w-10 h-10 justify-center p-4"
            : "w-full h-10 px-4 py-2"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
        onClick={handleClick}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="flex items-center justify-center shrink-0">
          {item.icon}
        </div>
        <div
          className={`flex-1 min-h-px min-w-px relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-3"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="flex flex-col justify-center relative size-full">
            <div className="font-['Lexend:Regular',_sans-serif] font-normal text-[14px] text-neutral-50 leading-[20px] truncate">
              {item.label}
            </div>
          </div>
        </div>
        {item.hasDropdown && (
          <div
            className={`flex items-center justify-center shrink-0 transition-opacity duration-500 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-2"
            }`}
            style={{
              transitionTimingFunction: softSpringEasing,
            }}
          >
            <ChevronDown
              size={16}
              className={`text-neutral-50 transition-transform duration-500`}
              style={{
                transitionTimingFunction: softSpringEasing,
                transform: isExpanded
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SubMenuItem({
  item,
  onItemClick,
}: {
  item: MenuItem;
  onItemClick?: () => void;
}) {
  return (
    <div className="select-none w-full pl-9 pr-1 py-[1px]">
      <div
        className="h-10 w-full rounded-lg cursor-pointer transition-colors hover:bg-neutral-900 flex items-center px-3 py-1"
        onClick={onItemClick}
      >
        <div className="flex-1 min-w-0">
          <div className="font-['Lexend:Regular',_sans-serif] font-normal text-[14px] text-neutral-300 leading-[18px] truncate">
            {item.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuSection({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
  onSubItemClick,
  activeSubItem,
}: {
  section: MenuSection;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
  isCollapsed?: boolean;
  onSubItemClick?: (label: string) => void;
  activeSubItem?: string;
}) {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-stretch p-0 relative shrink-0 w-full">
      <div
        className={`relative shrink-0 w-full transition-all duration-500 overflow-hidden ${
          isCollapsed ? "h-0 opacity-0" : "h-10 opacity-100"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className="flex flex-col justify-center relative size-full">
          <div className="box-border content-stretch flex flex-col h-10 items-start justify-center p-[16px] relative w-full">
            <div className="font-['Lexend:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[14px] text-left text-neutral-400 text-nowrap">
              <p className="block leading-[20px] whitespace-pre">
                {section.title}
              </p>
            </div>
          </div>
        </div>
      </div>
      {section.items.map((item, index) => {
        const itemKey = `${section.title}-${index}`;
        const isExpanded = expandedItems.has(itemKey);
        return (
          <div
            key={itemKey}
            className="w-full flex flex-col content-stretch"
          >
            <MenuItem
              item={{
                ...item,
                isActive: activeSubItem === item.label,
              }}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
              onItemClick={() => {
                if (onSubItemClick) onSubItemClick(item.label);
              }}
              isCollapsed={isCollapsed}
            />
            {isExpanded && item.children && !isCollapsed && (
              <div className="flex flex-col gap-1 mb-2">
                {item.children.map((child, childIndex) => (
                  <SubMenuItem
                    key={`${itemKey}-${childIndex}`}
                    item={child}
                    onItemClick={() =>
                      console.log(`Clicked ${child.label}`)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getSidebarContent(
  activeSection: string,
): SidebarContent {
  const contentMap: Record<string, SidebarContent> = {
    dashboard: {
      title: "Dashboard",
      sections: [
        {
          title: "Overview",
          items: [
            { icon: <Report size={16} className="text-neutral-50" />, label: "Data Lake Report", isActive: true },
            { icon: <Share size={16} className="text-neutral-50" />, label: "Sharing Summary" },
            { icon: <ChartBar size={16} className="text-neutral-50" />, label: "Data Dashboard" },
          ],
        },
      ],
    },
    querytool: {
      title: "Query Tool",
      sections: [
        {
          title: "Data Explorer",
          items: [
            { icon: <Search size={16} className="text-neutral-50" />, label: "New Query" },
            { icon: <DataViewAlt size={16} className="text-neutral-50" />, label: "Data Explorer" },
            { icon: <Report size={16} className="text-neutral-50" />, label: "Saved Queries" },
            { icon: <Time size={16} className="text-neutral-50" />, label: "History" },
          ],
        },
      ],
    },
    ingestor: {
      title: "Collections",
      sections: [
        {
          title: "Importation",
          items: [
            { icon: <CloudUpload size={16} className="text-neutral-50" />, label: "Collections" },
            { icon: <Integration size={16} className="text-neutral-50" />, label: "Connectors" },
            { icon: <DocumentAdd size={16} className="text-neutral-50" />, label: "File Uploader" },
          ],
        },
      ],
    },
    datamanager: {
      title: "Data Manager",
      sections: [
        {
          title: "Data Management",
          items: [
            { icon: <FolderOpen size={16} className="text-neutral-50" />, label: "Projects & Studies" },
            { icon: <Group size={16} className="text-neutral-50" />, label: "Entities" },
            { icon: <DataViewAlt size={16} className="text-neutral-50" />, label: "Variables" },
            { icon: <Analytics size={16} className="text-neutral-50" />, label: "Laboratory" },
            { icon: <Archive size={16} className="text-neutral-50" />, label: "Biobank" },
          ],
        },
      ],
    },
    audit: {
      title: "Audit",
      sections: [
        {
          title: "System Logs",
          items: [
            { icon: <Report size={16} className="text-neutral-50" />, label: "Operation Logs" },
            { icon: <Security size={16} className="text-neutral-50" />, label: "Access Logs" },
            { icon: <Flag size={16} className="text-neutral-50" />, label: "Security Alerts" },
          ],
        },
      ],
    },
    usermanager: {
      title: "User Manager",
      sections: [
        {
          title: "Users & Permissions",
          items: [
            { icon: <UserMultiple size={16} className="text-neutral-50" />, label: "User Management" },
            { icon: <Security size={16} className="text-neutral-50" />, label: "Roles & Permissions" },
          ],
        },
      ],
    },
    settings: {
      title: "Settings",
      sections: [
        {
          title: "Platform",
          items: [
            { icon: <Settings size={16} className="text-neutral-50" />, label: "General Configuration" },
            { icon: <Notification size={16} className="text-neutral-50" />, label: "Notifications" },
          ],
        },
        {
          title: "Standards & Integration",
          items: [
            { icon: <DataViewAlt size={16} className="text-neutral-50" />, label: "Data Standards" },
            { icon: <Integration size={16} className="text-neutral-50" />, label: "API Keys" },
          ],
        },
        {
          title: "Account",
          items: [
            { icon: <User size={16} className="text-neutral-50" />, label: "My Profile" },
          ],
        },
      ],
    },
  };

  return contentMap[activeSection] || contentMap.dashboard;
}

function IconNavButton({
  children,
  isActive = false,
  onClick,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative rounded-lg shrink-0 size-10 min-w-10 cursor-pointer transition-colors duration-500
        ${
          isActive
            ? "bg-neutral-800 text-neutral-50"
            : "hover:bg-neutral-900 text-neutral-400 hover:text-neutral-300"
        }`}
      style={{ transitionTimingFunction: softSpringEasing }}
      data-name="Icon Nav Button"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function IconNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navItems = [
    {
      id: "dashboard",
      icon: <Dashboard size={16} />,
      label: "Dashboard",
    },
    { id: "querytool", icon: <Search size={16} />, label: "QueryTool" },
    {
      id: "ingestor",
      icon: <CloudUpload size={16} />,
      label: "Ingestor",
    },
    {
      id: "datamanager",
      icon: <FolderOpen size={16} />,
      label: "Data Manager",
    },
    {
      id: "audit",
      icon: <Report size={16} />,
      label: "Audit",
    },
    {
      id: "usermanager",
      icon: <UserMultiple size={16} />,
      label: "User Manager",
    },
  ];

  return (
    <div
      className="bg-[#000000] box-border content-stretch flex flex-col gap-2 h-full items-center justify-start overflow-clip p-4 relative shrink-0 w-16 border-r border-neutral-800"
      data-name="Icon Navigation"
    >
      {/* Logo */}
      <div className="mb-2 size-10 flex items-center justify-center">
        <div className="size-7">
          <InterfacesLogo1 />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex-1" />
      <div className="flex flex-col gap-2 w-full items-center">
        <IconNavButton
          isActive={activeSection === "settings"}
          onClick={() => onSectionChange("settings")}
        >
          <Settings size={16} />
        </IconNavButton>
        <div className="size-8">
          <Avatar />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  onToggleCollapse,
  isCollapsed,
}: {
  title: string;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <div
        className="relative shrink-0 w-full flex justify-center transition-all duration-500"
        style={{ transitionTimingFunction: softSpringEasing }}
        data-name="Section Title Collapsed"
      >
        <button
          onClick={onToggleCollapse}
          className="box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative rounded-lg shrink-0 cursor-pointer transition-all duration-500 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-300 size-10 min-w-10"
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <ChevronLeft
            size={16}
            className="transition-transform duration-500"
            style={{
              transitionTimingFunction: softSpringEasing,
              transform: "rotate(180deg)",
            }}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 w-full overflow-hidden transition-all duration-500"
      style={{ transitionTimingFunction: softSpringEasing }}
      data-name="Section Title"
    >
      <div className="flex flex-row items-center justify-between relative size-full">
        <div
          className="box-border content-stretch flex flex-row items-center justify-start relative h-10 overflow-hidden transition-opacity opacity-100 duration-500"
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-center px-2 py-1 relative shrink-0">
            <div className="font-['Lexend:SemiBold',_sans-serif] font-semibold leading-[0] relative shrink-0 text-[18px] text-left text-neutral-50 text-nowrap">
              <p className="block leading-[27px] whitespace-pre">
                {title}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pr-1">
          <button
            onClick={onToggleCollapse}
            className="box-border content-stretch flex flex-row items-center justify-center overflow-clip p-0 relative rounded-lg shrink-0 cursor-pointer transition-all duration-500 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-300 size-10 min-w-10"
            style={{
              transitionTimingFunction: softSpringEasing,
            }}
          >
            <ChevronLeft
              size={16}
              className="transition-transform duration-500"
              style={{
                transitionTimingFunction: softSpringEasing,
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSidebar({
  activeSection,
  onSubItemClick,
  activeSubItem,
}: {
  activeSection: string;
  onSubItemClick?: (label: string) => void;
  activeSubItem?: string;
}) {
  const [expandedItems, setExpandedItems] = useState<
    Set<string>
  >(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const content = getSidebarContent(activeSection);

  const toggleExpanded = (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`bg-[#000000] box-border content-stretch flex flex-col gap-4 h-full items-start justify-start overflow-visible p-4 relative border-r border-neutral-800 shrink-0 transition-all duration-500 ${
        isCollapsed
          ? "w-16 min-w-16 !px-0 justify-center"
          : "w-80"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
      data-name="Detail Sidebar"
    >
      <SectionTitle
        title={content.title}
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />

      <div
        className={`basis-0 box-border content-stretch flex flex-col grow min-h-px min-w-10 p-0 relative shrink-0 w-full overflow-y-auto transition-all duration-500 ${
          isCollapsed
            ? "gap-2 items-center justify-start"
            : "gap-4 items-start justify-start"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        {content.sections.map((section, index) => (
          <MenuSection
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={isCollapsed}
            onSubItemClick={onSubItemClick}
            activeSubItem={activeSubItem}
          />
        ))}
      </div>
    </div>
  );
}

export function TwoLevelSidebar({ 
  activeSection = "dashboard", 
  onSectionChange,
  onSubItemClick,
  activeSubItem,
}: { 
  activeSection?: string; 
  onSectionChange?: (section: string) => void;
  onSubItemClick?: (label: string) => void;
  activeSubItem?: string;
}) {
  const [internalSection, setInternalSection] = useState("dashboard");
  const currentSection = onSectionChange ? activeSection : internalSection;
  const handleSectionChange = onSectionChange || setInternalSection;

  return (
    <div
      className="flex flex-row h-full"
      data-name="Two Level Sidebar"
    >
      <IconNavigation
        activeSection={currentSection}
        onSectionChange={handleSectionChange}
      />
      <DetailSidebar 
        activeSection={currentSection} 
        onSubItemClick={onSubItemClick}
        activeSubItem={activeSubItem}
      />
    </div>
  );
}

export function Frame760() {
  return (
    <div className="bg-[#1a1a1a] box-border content-stretch flex flex-row gap-4 items-center justify-center p-0 relative size-full min-h-screen">
      <TwoLevelSidebar />
    </div>
  );
}