import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Video, Shield, MessageSquareWarning,
  Map as MapIcon, Bell, ClipboardList, FileText,
  User, Scale, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSidebarShell from '../components/RoleSidebarShell';
import ChatbotWidget from '../components/ChatbotWidget';

// Admin tabs — imported lazily to avoid crashes if a file has TS issues
import OverviewTab from '../components/OverviewTab';
import AlertsTab from '../components/AlertsTab';
import MapTab from '../components/MapTab';
import InspectionsTab from '../components/InspectionsTab';
import ReportsTab from '../components/ReportsTab';
import AdminDebatesTab from '../components/AdminDebatesTab';
import ScorecardTab from '../components/shared/ScorecardTab';
import AdminComplaintsHub from '../components/admin/AdminComplaintsHub';
import AdminProfileTab from '../components/admin/AdminProfileTab';
import CreateComplaintTab from '../components/customer/CreateComplaintTab';
import LiveVisionInspectionPage from '../components/LiveVisionInspectionPage';
import InventoryVerificationTab from '../components/shared/InventoryVerificationTab';
import { PackageSearch } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',    label: 'Dashboard',              icon: LayoutGrid },
  { key: 'complaints',   label: 'Complaints & Live Vision', icon: MessageSquareWarning },
  { key: 'create-complaint', label: 'Create Admin Complaint', icon: FileText },
  { key: 'debates',      label: 'Violations & Debates',   icon: Scale },
  { key: 'scorecards',   label: 'Scorecards',             icon: Shield },
  { key: 'map',          label: 'Map View',               icon: MapIcon },
  { key: 'inventory-hub', label: 'Product Verification & Inventory', icon: PackageSearch },
  { key: 'alerts',       label: 'Alerts',                 icon: Bell },
  { key: 'inspections',  label: 'Inspections',            icon: ClipboardList },
  { key: 'reports',      label: 'Reports',                icon: FileText },
  { key: 'profile',      label: 'Profile',                icon: User },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const [activeKey, setActiveKey] = useState('dashboard');
  const [liveVisionComplaint, setLiveVisionComplaint] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <RoleSidebarShell
        portalLabel="Admin / Regulator Portal"
        navItems={NAV_ITEMS}
        activeKey={activeKey}
        onNavigate={setActiveKey}
        profile={profile}
        onLogout={handleLogout}
      >
        {activeKey === 'dashboard' && <OverviewTab />}
        {activeKey === 'complaints' && <AdminComplaintsHub />}
        {activeKey === 'create-complaint' && <CreateComplaintTab onSubmitted={(id) => { setActiveKey('complaints'); }} />}
        {activeKey === 'debates' && <AdminDebatesTab />}
        {activeKey === 'scorecards' && <ScorecardTab />}
        {activeKey === 'map' && <MapTab />}
        {activeKey === 'inventory-hub' && <InventoryVerificationTab establishmentId="ALL-REGULATORY" />}
        {activeKey === 'alerts' && <AlertsTab />}
        {activeKey === 'inspections' && (
          <InspectionsTab onRunLiveVision={(complaint) => {
            setLiveVisionComplaint(complaint);
            setActiveKey('live-vision');
          }} />
        )}
        {activeKey === 'live-vision' && liveVisionComplaint && (
          <LiveVisionInspectionPage complaint={liveVisionComplaint} onBack={() => setActiveKey('inspections')} />
        )}
        {activeKey === 'reports' && <ReportsTab />}
        {activeKey === 'profile' && <AdminProfileTab profile={profile} />}
      </RoleSidebarShell>
      <ChatbotWidget />
    </>
  );
}