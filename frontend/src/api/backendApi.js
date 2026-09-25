import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ─── Scorecards ──────────────────────────────────────────────
export const fetchEstablishmentScorecard = async (establishmentId) => {
    try {
        const response = await axios.get(`${API_BASE}/scorecards/${establishmentId}`);
        return response.data;
    } catch (e) {
        console.error('Error fetching scorecard', e);
        return null;
    }
};

// ─── Violations ──────────────────────────────────────────────
export const fetchEstablishmentViolations = async (establishmentId) => {
    try {
        const response = await axios.get(`${API_BASE}/violations/establishment/${establishmentId}`);
        return response.data;
    } catch (e) {
        console.error('Error fetching violations', e);
        return [];
    }
};

// ─── Alerts ──────────────────────────────────────────────────
export const fetchAlerts = async () => {
    try {
        const response = await axios.get(`${API_BASE}/alerts/`);
        return response.data;
    } catch (e) {
        console.error('Error fetching alerts', e);
        return [];
    }
};

export const markAlertRead = async (alertId) => {
    try {
        const response = await axios.patch(`${API_BASE}/alerts/${alertId}`, { status: 'read' });
        return response.data;
    } catch (e) {
        console.error('Error updating alert', e);
        return null;
    }
};

// ─── Debate Logs ─────────────────────────────────────────────
export const fetchDebateLog = async (debateId) => {
    try {
        const response = await axios.get(`${API_BASE}/debate-log/${debateId}`);
        return response.data;
    } catch (e) {
        console.error('Error fetching debate log', e);
        return null;
    }
};

// ─── Vision AI Ingestion (Admin only) ────────────────────────
export const ingestFrame = async (establishmentId, file, complaintId = null) => {
    try {
        const formData = new FormData();
        formData.append('establishment_id', establishmentId);
        if (complaintId) formData.append('complaint_id', complaintId);
        formData.append('file', file);
        const response = await axios.post(`${API_BASE}/ingest-frame`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 180000,
        });
        return response.data;
    } catch (e) {
        console.error('Error ingesting frame', e);
        const detail = e.response?.data?.detail || e.response?.data?.message;
        if (detail) throw new Error(`Backend ${e.response.status}: ${detail}`);
        if (e.code === 'ECONNABORTED') throw new Error('Backend request timed out after 180 seconds. YOLO or the AI agents are still running.');
        if (!e.response) throw new Error('Cannot reach backend at http://localhost:8000. Start FastAPI first.');
        throw new Error(`Backend request failed with HTTP ${e.response.status}.`);
    }
};

export const streamInspection = async (establishmentId, file, complaintId, onEvent) => {
    const formData = new FormData();
    formData.append('establishment_id', establishmentId);
    if (complaintId) formData.append('complaint_id', complaintId);
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/ingest-frame/stream`, { method: 'POST', body: formData });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Backend ${response.status}: ${detail}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        events.filter(Boolean).forEach((chunk) => {
            const line = chunk.split('\n').find((entry) => entry.startsWith('data: '));
            if (line) onEvent(JSON.parse(line.slice(6)));
        });
        if (done) break;
    }
};

export const updateComplaint = async (complaintId, updates) => {
    try {
        const response = await axios.patch(`${API_BASE}/complaints/${complaintId}`, updates);
        return response.data;
    } catch (e) {
        console.error('Error updating complaint', e);
        return null;
    }
};

// ─── Copilot / Inspection Checklist (Admin only) ─────────────
export const fetchCopilotChecklist = async (establishmentId, complaintId = null, detections = []) => {
    try {
        const response = await axios.post(`${API_BASE}/inspection-copilot/checklist`, {
            establishment_id: establishmentId,
            complaint_id: complaintId,
            detections,
            detected_violations: detections.map((detection) => detection.class),
        });
        return response.data;
    } catch (e) {
        console.error('Error fetching copilot checklist', e);
        const detail = e.response?.data?.detail || e.response?.data?.message;
        throw new Error(detail ? `Copilot backend ${e.response.status}: ${detail}` : 'Copilot backend is unavailable.');
    }
};

// ─── Map / Establishments ────────────────────────────────────
export const fetchMapEstablishments = async () => {
    try {
        const response = await axios.get(`${API_BASE}/map/establishments`);
        return response.data;
    } catch (e) {
        console.error('Error fetching map data', e);
        return [];
    }
};

// ─── Rankings ────────────────────────────────────────────────
export const fetchRankings = async () => {
    try {
        const response = await axios.get(`${API_BASE}/rankings`);
        return response.data;
    } catch (e) {
        console.error('Error fetching rankings', e);
        return null;
    }
};

// ─── Complaints ──────────────────────────────────────────────
export const createComplaint = async (complaintData) => {
    try {
        const response = await axios.post(`${API_BASE}/complaints/`, complaintData);
        return response.data;
    } catch (e) {
        console.error('Error submitting complaint', e);
        return null;
    }
};

export const fetchComplaints = async (userId = null, establishmentId = null, ownerEmail = null, userEmail = null) => {
    try {
        const params = {};
        if (userId) params.user_id = userId;
        if (establishmentId) params.establishment_id = establishmentId;
        if (ownerEmail) params.owner_email = ownerEmail;
        if (userEmail) params.user_email = userEmail;
        const response = await axios.get(`${API_BASE}/complaints/`, { params });
        return response.data;
    } catch (e) {
        console.error('Error fetching complaints', e);
        return [];
    }
};

export const fetchComplaintById = async (complaintId) => {
    try {
        const response = await axios.get(`${API_BASE}/complaints/${complaintId}`);
        return response.data;
    } catch (e) {
        console.error('Error fetching complaint', e);
        return null;
    }
};

export const fetchComplaintReport = async (complaintId) => {
    const response = await axios.get(`${API_BASE}/complaints/${complaintId}/report`);
    return response.data;
};

export const fetchScorecardById = async (scorecardId) => {
    const response = await axios.get(`${API_BASE}/scorecards/id/${scorecardId}`);
    return response.data;
};

export const fetchComplaintScorecard = async (complaintId) => {
    const response = await axios.get(`${API_BASE}/scorecards/complaint/${complaintId}`);
    return response.data;
};

export const fetchComplaintViolations = async (complaintId) => {
    const response = await axios.get(`${API_BASE}/violations/complaint/${complaintId}`);
    return response.data;
};

export const fetchReports = async (complaintId = null, establishmentId = null) => {
    const params = {};
    if (complaintId) params.complaint_id = complaintId;
    if (establishmentId) params.establishment_id = establishmentId;
    const response = await axios.get(`${API_BASE}/reports`, { params });
    return response.data;
};

export const fetchViolationById = async (violationId) => {
    const response = await axios.get(`${API_BASE}/violations/${violationId}`);
    return response.data;
};

export const triggerLiveComplaintInspection = async (complaintId) => {
    try {
        const response = await axios.post(`${API_BASE}/complaints/${complaintId}/live-inspection`);
        return response.data;
    } catch (e) {
        console.error('Error triggering live camera inspection', e);
        return null;
    }
};
