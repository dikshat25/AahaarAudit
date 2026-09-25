import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Search, FilePlus2, ListChecks, Route, MapPin, Bell, User, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSidebarShell from '../components/RoleSidebarShell';
import CustomerHomeTab from '../components/customer/CustomerHomeTab';
import FindEstablishmentsTab from '../components/customer/FindEstablishmentsTab';
import CreateComplaintTab from '../components/customer/CreateComplaintTab';
import MyComplaintsTab from '../components/customer/MyComplaintsTab';
import ComplaintTrackingTab from '../components/customer/ComplaintTrackingTab';
import CustomerMapTab from '../components/customer/CustomerMapTab';
import CustomerNotificationsTab from '../components/customer/CustomerNotificationsTab';
import CustomerProfileTab from '../components/customer/CustomerProfileTab';
import ScorecardTab from '../components/shared/ScorecardTab';
import ChatbotWidget from '../components/ChatbotWidget';
import AdminComplaintsHub from '../components/admin/AdminComplaintsHub';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { key: 'scorecards', label: 'Hygiene Scorecards', icon: ShieldCheck },
  { key: 'create-complaint', label: 'Create Complaint', icon: FilePlus2 },
  { key: 'my-complaints', label: 'My Complaints', icon: ListChecks },
  { key: 'tracking', label: 'Complaint Tracking', icon: Route },
  { key: 'admin-complaints', label: 'Admin Complaints', icon: ShieldAlert },
  { key: 'map', label: 'Map View & Search', icon: MapPin },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'profile', label: 'Profile', icon: User },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const [activeKey, setActiveKey] = useState('dashboard');
  const [prefillEstablishment, setPrefillEstablishment] = useState(null);
  const [trackedComplaintId, setTrackedComplaintId] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToComplaintForm = (establishment) => {
    setPrefillEstablishment(establishment);
    setActiveKey('create-complaint');
  };

  const openComplaintTracking = (id) => {
    setTrackedComplaintId(id);
    setActiveKey('tracking');
  };

  return (
    <>
      <RoleSidebarShell
        portalLabel="Customer Portal"
        navItems={NAV_ITEMS}
        activeKey={activeKey}
        onNavigate={setActiveKey}
        profile={profile}
        onLogout={handleLogout}
      >
        {activeKey === 'dashboard' && <CustomerHomeTab profile={profile} onNavigate={setActiveKey} />}
        {activeKey === 'scorecards' && <ScorecardTab />}
        {activeKey === 'create-complaint' && (
          <CreateComplaintTab
            prefillEstablishment={prefillEstablishment}
            onSubmitted={openComplaintTracking}
          />
        )}
        {activeKey === 'my-complaints' && <MyComplaintsTab onOpenComplaint={openComplaintTracking} />}
        {activeKey === 'tracking' && (
          <ComplaintTrackingTab selectedId={trackedComplaintId} onSelect={setTrackedComplaintId} />
        )}
        {activeKey === 'admin-complaints' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-4 shadow-gov-card">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-display font-bold text-[#0A2647] text-base">Regulatory Complaints Feed</h3>
              </div>
              <p className="text-xs text-[#0A2647]/60">
                View-only feed of active food safety complaints filed by regulatory administrators.
                These are official food safety actions in your area.
              </p>
            </div>
            <AdminComplaintsHub readOnly={true} />
          </div>
        )}
        {activeKey === 'map' && <CustomerMapTab />}
        {activeKey === 'notifications' && <CustomerNotificationsTab />}
        {activeKey === 'profile' && <CustomerProfileTab profile={profile} />}
      </RoleSidebarShell>
      <ChatbotWidget />
    </>
  );
}
