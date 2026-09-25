import React, { useEffect, useState } from 'react';
import { Bell, FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CUSTOMER_NOTIFICATIONS } from '../../mockData/notifications';
import { fetchAlerts, markAlertRead } from '../../api/backendApi';

const ICONS = {
  complaint: FileText,
  corrective_action: CheckCircle2,
  alert: ShieldAlert,
  inspection: ShieldAlert,
  system: Bell,
};

export default function CustomerNotificationsTab() {
  const [notifications, setNotifications] = useState(CUSTOMER_NOTIFICATIONS);

  useEffect(() => {
    const loadAlerts = async () => {
      const data = await fetchAlerts();
      const liveAlerts = data.map((a) => ({
        id: a.alert_id,
        kind: 'alert',
        title: `Food Safety Alert: ${a.severity.toUpperCase()}`,
        body: `${a.message} (Establishment: ${a.establishment_id})`,
        timestamp: a.timestamp,
        read: a.status === 'read',
      }));
      setNotifications([...liveAlerts, ...CUSTOMER_NOTIFICATIONS]);
    };
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    if (id.toString().startsWith('ALERT-')) {
      await markAlertRead(id);
    }
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded flex items-center justify-between">
        <span>🔔 Live Public Food Safety Alerts (Connected to FastAPI)</span>
        <span className="animate-pulse font-mono">LIVE SYNC</span>
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
      {notifications.length === 0 && (
        <p className="text-sm text-[#0A2647]/50 text-center py-10">No alerts or notifications yet.</p>
      )}
    </div>
  );
}
