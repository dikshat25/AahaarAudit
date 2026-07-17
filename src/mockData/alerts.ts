export type Alert = {
  id: string;
  agentId: string;
  agentName: string;
  location: string;
  type: string;
  description: string;
  riskScore: number;
  confidence: number;
  timestamp: string;
  evidenceType: 'vision' | 'document' | 'chart' | 'review';
  evidenceData?: any;
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a-1',
    agentId: 'agent-1',
    agentName: 'Vision Inspection Agent',
    location: 'Dadar Dark Store #58',
    type: 'Hygiene Violation',
    description: 'Gloves not detected on prep station 2.',
    riskScore: 85,
    confidence: 0.94,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    evidenceType: 'vision',
  },
  {
    id: 'a-2',
    agentId: 'agent-2',
    agentName: 'Product Verification Agent',
    location: 'Bandra Central Kitchen',
    type: 'Barcode Mismatch',
    description: 'Label claims Batch #4471, OCR-scanned expiry does not match supplier record.',
    riskScore: 65,
    confidence: 0.88,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    evidenceType: 'document',
    evidenceData: { claimed: 'Batch #4471 (Exp: Dec 2024)', observed: 'Batch #4471 (Exp: Aug 2023)' }
  },
  {
    id: 'a-3',
    agentId: 'agent-5',
    agentName: 'Fraud Detection Agent',
    location: 'Pune Express Foods',
    type: 'Invoice Anomaly',
    description: 'Submitted purchase log shows stock levels inconsistent with CCTV-observed usage — possible falsified record.',
    riskScore: 92,
    confidence: 0.91,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    evidenceType: 'chart',
    evidenceData: { claimed: 500, observed: 120, unit: 'kg' }
  },
  {
    id: 'a-4',
    agentId: 'agent-6',
    agentName: 'Complaint Intelligence Agent',
    location: 'Nashik Fresh Bites',
    type: 'Public Risk Review',
    description: 'Multiple users reporting food poisoning symptoms after consuming paneer dishes.',
    riskScore: 98,
    confidence: 0.97,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    evidenceType: 'review',
    evidenceData: { snippet: '"जेवण खाल्ल्यानंतर खूप त्रास झाला, पनीर खराब होते..."', sentiment: 'Critical', urgency: 'High' }
  }
];
