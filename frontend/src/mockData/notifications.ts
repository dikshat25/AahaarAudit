export type AppNotification = {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  kind: 'complaint' | 'inspection' | 'system' | 'alert' | 'corrective_action';
};

export const CUSTOMER_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-c-1',
    title: 'Complaint CMP-10245 escalated',
    body: 'Your complaint against Nashik Fresh Bites has been marked CRITICAL and assigned to an inspector.',
    timestamp: '2026-09-21T09:10:00',
    read: false,
    kind: 'complaint',
  },
  {
    id: 'n-c-2',
    title: 'Corrective action submitted',
    body: 'Dadar Dark Store #58 has submitted evidence for your hygiene complaint (CMP-10238).',
    timestamp: '2026-09-18T08:30:00',
    read: false,
    kind: 'corrective_action',
  },
  {
    id: 'n-c-3',
    title: 'Complaint CMP-10201 closed',
    body: 'Your packaging complaint against Bandra Central Kitchen has been resolved and verified.',
    timestamp: '2026-09-06T11:00:00',
    read: true,
    kind: 'complaint',
  },
];

export const OWNER_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-o-1',
    title: 'New preventive complaint received',
    body: 'A customer reported an unclean prep area. Please review and submit corrective action.',
    timestamp: '2026-09-15T13:00:00',
    read: false,
    kind: 'complaint',
  },
  {
    id: 'n-o-2',
    title: 'Sensor anomaly detected',
    body: 'Cold-storage unit 2 recorded a temperature excursion above the safe threshold for 22 minutes.',
    timestamp: '2026-09-19T04:12:00',
    read: false,
    kind: 'alert',
  },
  {
    id: 'n-o-3',
    title: 'Inspection completed',
    body: 'Maharashtra FDA completed a routine inspection. Compliance score updated to 82%.',
    timestamp: '2026-09-10T15:45:00',
    read: true,
    kind: 'inspection',
  },
];
