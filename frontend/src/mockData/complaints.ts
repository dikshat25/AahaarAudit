export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI Analysis'
  | 'Assigned'
  | 'Under Investigation'
  | 'Inspection Scheduled'
  | 'Inspection Completed'
  | 'Resolution'
  | 'Closed';

export const COMPLAINT_CATEGORIES = [
  'Food quality',
  'Hygiene',
  'Food poisoning',
  'Expired food',
  'Foreign object',
  'Poor storage',
  'Temperature issue',
  'Packaging issue',
  'Staff hygiene',
  'Product mismatch',
  'Other',
];

export type ComplaintTimelineStep = {
  label: string;
  done: boolean;
  timestamp?: string;
  note?: string;
};

export type Complaint = {
  id: string;
  customerName: string;
  establishment: string;
  establishmentId: string;
  category: string;
  title: string;
  description: string;
  productInvolved?: string;
  orderRef?: string;
  priority: ComplaintPriority;
  riskScore: number;
  status: ComplaintStatus;
  submittedAt: string;
  lastUpdated: string;
  assignedOfficer?: string;
  images?: number;
  timeline: ComplaintTimelineStep[];
  correctiveAction?: {
    requested: string;
    ownerResponse?: string;
    evidenceUploaded?: boolean;
    verified?: boolean;
  };
};

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-10245',
    customerName: 'Rohan Mehta',
    establishment: 'Nashik Fresh Bites',
    establishmentId: 'k-6',
    category: 'Food poisoning',
    title: 'Severe stomach upset after paneer dish',
    description:
      'Ordered paneer butter masala for dinner and experienced nausea and stomach cramps within two hours. Two other people in my group who ate the same dish had similar symptoms.',
    productInvolved: 'Paneer Butter Masala',
    orderRef: 'ORD-88421',
    priority: 'CRITICAL',
    riskScore: 96,
    status: 'Under Investigation',
    submittedAt: '2026-09-20T19:40:00',
    lastUpdated: '2026-09-22T10:05:00',
    assignedOfficer: 'Insp. A. Kulkarni',
    images: 2,
    timeline: [
      { label: 'Complaint Submitted', done: true, timestamp: '2026-09-20T19:40:00' },
      { label: 'AI Analysis', done: true, timestamp: '2026-09-20T19:42:00', note: 'Cross-referenced with 3 similar recent reports for this outlet.' },
      { label: 'Priority Generated', done: true, timestamp: '2026-09-20T19:42:00', note: 'CRITICAL — pattern of food-poisoning reports detected.' },
      { label: 'Assigned to Regulator/Inspector', done: true, timestamp: '2026-09-21T09:10:00', note: 'Assigned to Insp. A. Kulkarni' },
      { label: 'Under Investigation', done: true, timestamp: '2026-09-22T10:05:00' },
      { label: 'Inspection Scheduled', done: false },
      { label: 'Inspection Completed', done: false },
      { label: 'Resolution', done: false },
      { label: 'Closed', done: false },
    ],
  },
  {
    id: 'CMP-10238',
    customerName: 'Rohan Mehta',
    establishment: 'Dadar Dark Store #58',
    establishmentId: 'k-1',
    category: 'Hygiene',
    title: 'Food preparation area was not properly cleaned',
    description:
      'Noticed food debris and grime on the prep counter visible from the delivery pickup window.',
    priority: 'LOW',
    riskScore: 34,
    status: 'Resolution',
    submittedAt: '2026-09-15T12:15:00',
    lastUpdated: '2026-09-18T08:30:00',
    images: 1,
    timeline: [
      { label: 'Complaint Submitted', done: true, timestamp: '2026-09-15T12:15:00' },
      { label: 'AI Analysis', done: true, timestamp: '2026-09-15T12:17:00' },
      { label: 'Priority Generated', done: true, timestamp: '2026-09-15T12:17:00', note: 'LOW — routed for preventive handling.' },
      { label: 'Assigned to Regulator/Inspector', done: true, timestamp: '2026-09-15T13:00:00', note: 'Routed to outlet for corrective action.' },
      { label: 'Under Investigation', done: false },
      { label: 'Inspection Scheduled', done: false },
      { label: 'Inspection Completed', done: false },
      { label: 'Resolution', done: true, timestamp: '2026-09-18T08:30:00', note: 'Outlet uploaded cleaning evidence; pending final verification.' },
      { label: 'Closed', done: false },
    ],
    correctiveAction: {
      requested: 'Clean and sanitize the prep area; update daily cleaning checklist.',
      ownerResponse: 'Deep-cleaned the prep counter and re-trained staff on the cleaning checklist.',
      evidenceUploaded: true,
      verified: false,
    },
  },
  {
    id: 'CMP-10201',
    customerName: 'Rohan Mehta',
    establishment: 'Bandra Central Kitchen',
    establishmentId: 'k-2',
    category: 'Packaging issue',
    title: 'Container was damaged and leaking',
    description: 'The curry container lid was cracked and gravy leaked into the bag.',
    priority: 'LOW',
    riskScore: 18,
    status: 'Closed',
    submittedAt: '2026-09-02T20:05:00',
    lastUpdated: '2026-09-06T11:00:00',
    images: 1,
    timeline: [
      { label: 'Complaint Submitted', done: true, timestamp: '2026-09-02T20:05:00' },
      { label: 'AI Analysis', done: true, timestamp: '2026-09-02T20:07:00' },
      { label: 'Priority Generated', done: true, timestamp: '2026-09-02T20:07:00' },
      { label: 'Assigned to Regulator/Inspector', done: true, timestamp: '2026-09-03T09:00:00' },
      { label: 'Under Investigation', done: true, timestamp: '2026-09-03T09:00:00' },
      { label: 'Inspection Scheduled', done: false },
      { label: 'Inspection Completed', done: false },
      { label: 'Resolution', done: true, timestamp: '2026-09-05T14:20:00' },
      { label: 'Closed', done: true, timestamp: '2026-09-06T11:00:00', note: 'Outlet switched packaging supplier; verified by regulator.' },
    ],
    correctiveAction: {
      requested: 'Switch to leak-proof packaging for gravy items.',
      ownerResponse: 'Moved to sealed, tamper-proof containers for all curry items from Sept 5.',
      evidenceUploaded: true,
      verified: true,
    },
  },
];
