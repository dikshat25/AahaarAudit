import React, { useEffect, useState } from 'react';
import { Bell, FileText, ShieldAlert, ClipboardCheck } from 'lucide-react';
import { fetchAlerts, markAlertRead } from '../../api/backendApi';
import { OWNER_NOTIFICATIONS } from '../../mockData/notifications';

const ICONS = {
  complaint: FileText,
  alert: ShieldAlert,
  inspection: ClipboardCheck,
  corrective_action: ClipboardCheck,
  system: Bell,
};

export default function OwnerNotificationsTab({ profile }) {
  // Start with mock data just so page isn't totally empty, but override with LIVE alerts
  const [notifications, setNotifications] = useState(OWNER_NOTIFICATIONS);
  const establishmentId = profile?.establishment_id || 'REST-001';

  useEffect(() => {
    const loadAlerts = async () => {
      const data = await fetchAlerts();
      // Filter for this establishment
      const myAlerts = data.filter(a => a.establishment_id === establishmentId);
      
      // Map backend alert format to frontend notification format
      const mappedAlerts = myAlerts.map(a => ({
          id: a.alert_id,
          kind: 'alert',
          title: `AI Security Alert: ${a.severity.toUpperCase()}`,
          body: a.message,
          timestamp: a.timestamp,
          read: a.status === 'read'
      }));
      
      // Prepend live mapped alerts to mock notifications
      setNotifications([...mappedAlerts, ...OWNER_NOTIFICATIONS]);
    };
    
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, [establishmentId]);

  const handleMarkRead = async (id) => {
    // If it's a real live alert (starts with ALERT-)
    if (id.toString().startsWith('ALERT-')) {
        await markAlertRead(id);
    }
    // Update UI instantly
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded mb-2">
         🔔 Live FastAPI Alert System Connected!
      </div>
      {notifications.map((n) => {
        const Icon = ICONS[n.kind] || Bell;
        return (
          <button
            key={n.id}
            onClick={() => handleMarkRead(n.id)}
            className={`w-full text-left flex gap-3 rounded-xl border p-4 transition-colors ${
              n.read ? 'bg-white border-[#0A2647]/10' : 'bg-[#0A2647]/5 border-[#0A2647]/15'
            }`}
          >
            <div className="p-2 rounded-lg bg-white border border-[#0A2647]/10 h-fit shrink-0">
              <Icon className="w-4 h-4 text-[#0A2647]/60" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#0A2647]">{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#FF9933] shrink-0 animate-pulse" />}
              </div>
              <p className="text-xs text-[#0A2647]/60 mt-0.5">{n.body}</p>
              <p className="text-[11px] text-[#0A2647]/35 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
            </div>
          </button>
        );
      })}
      {notifications.length === 0 && <p className="text-sm text-[#0A2647]/50 text-center py-10">No notifications yet.</p>}
    </div>
  );
}
