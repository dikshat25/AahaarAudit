import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  MessageSquareWarning,
  ShieldCheck,
  PackageSearch,
  Video,
  FileText,
  User,
  MapPin,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSidebarShell from '../components/RoleSidebarShell';
import OwnerHomeTab from '../components/owner/OwnerHomeTab';
import OwnerComplaintsTab from '../components/owner/OwnerComplaintsTab';
import OwnerHygieneTab from '../components/owner/OwnerHygieneTab';
import OwnerReportsTab from '../components/owner/OwnerReportsTab';
import OwnerProfileTab from '../components/owner/OwnerProfileTab';
import ScorecardTab from '../components/shared/ScorecardTab';
import CustomerMapTab from '../components/customer/CustomerMapTab';
import LiveVisionInspectionPage from '../components/LiveVisionInspectionPage';
import InventoryVerificationTab from '../components/shared/InventoryVerificationTab';
import ChatbotWidget from '../components/ChatbotWidget';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { key: 'scorecards', label: 'Scorecards', icon: Shield },
  { key: 'monitoring', label: 'AI Monitoring & Debates', icon: Video },
  { key: 'reports', label: 'Inspection Reports', icon: FileText },
  { key: 'map', label: 'Map View', icon: MapPin },
  { key: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
  { key: 'inventory-hub', label: 'Inventory, Products & Suppliers', icon: PackageSearch },
  { key: 'hygiene', label: 'Hygiene & Compliance', icon: ShieldCheck },
  { key: 'profile', label: 'Profile', icon: User },
];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const [activeKey, setActiveKey] = useState('dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <RoleSidebarShell
        portalLabel={`${profile?.business_type || 'Owner'} Portal`}
        navItems={NAV_ITEMS}
        activeKey={activeKey}
        onNavigate={setActiveKey}
        profile={profile}
        onLogout={handleLogout}
      >
        {activeKey === 'dashboard' && <OwnerHomeTab profile={profile} onNavigate={setActiveKey} />}
        {activeKey === 'scorecards' && <ScorecardTab establishmentId={profile?.establishment_id} />}
        {activeKey === 'monitoring' && (
          <LiveVisionInspectionPage
            complaint={{
              establishmentId: profile?.establishment_id || 'REST-001',
              establishmentName: profile?.business_name || 'Hotel Grand Palace',
              ownerEmail: profile?.email || 'hotel@gmail.com',
              id: 'CMP-OWNER-STREAM',
              title: 'Routine AI Inspection & Optical Surveillance',
              description: 'Live kitchen inspection and tri-agent compliance debate stream.'
            }}
          />
        )}
        {activeKey === 'reports' && <OwnerReportsTab profile={profile} />}
        {activeKey === 'map' && <CustomerMapTab />}
        {activeKey === 'complaints' && <OwnerComplaintsTab profile={profile} />}
        {activeKey === 'inventory-hub' && <InventoryVerificationTab establishmentId={profile?.establishment_id || 'REST-001'} />}
        {activeKey === 'hygiene' && <OwnerHygieneTab />}
        {activeKey === 'profile' && <OwnerProfileTab profile={profile} />}
      </RoleSidebarShell>
      <ChatbotWidget />
    </>
  );
}
