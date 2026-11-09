/**
 * ==============================================================================
 * SEVASAAR AI • BACKEND REST API CLIENT (Vanilla JS Fetch API)
 * ==============================================================================
 */

const API_BASE_URL = window.location.origin;

function extractErrorMessage(errorData, defaultMsg) {
  if (!errorData) return defaultMsg;
  if (typeof errorData.detail === 'string') return errorData.detail;
  if (Array.isArray(errorData.detail)) {
    return errorData.detail.map(d => `${d.loc ? d.loc.slice(-1) : ''}: ${d.msg}`).join(', ');
  }
  if (errorData.message) return errorData.message;
  return defaultMsg;
}

export const ApiClient = {
  /**
   * Health Check
   */
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      return await res.json();
    } catch (err) {
      console.error('[API] Health check failed:', err);
      return { status: 'error', service: 'offline' };
    }
  },

  /**
   * Detect Language & Script
   */
  async detectLanguage(text) {
    const res = await fetch(`${API_BASE_URL}/api/detect-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await res.json();
  },

  /**
   * Generate AI Structured Clinical Summary
   */
  async generateSummary(payload) {
    const res = await fetch(`${API_BASE_URL}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(extractErrorMessage(errorData, 'Failed to generate medical summary'));
    }
    return await res.json();
  },

  /**
   * Register Patient Intake & Issue OPD Token
   */
  async createPatient(payload) {
    const res = await fetch(`${API_BASE_URL}/api/patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(extractErrorMessage(errorData, 'Failed to register patient intake'));
    }
    return await res.json();
  },

  /**
   * Fetch OPD Patients Queue with Filters
   */
  async getPatients(status = null, search = null) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());

    const url = `${API_BASE_URL}/api/patients?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch patient queue');
    return await res.json();
  },

  /**
   * Get Single Patient Record by ID or Token
   */
  async getPatient(idOrToken) {
    const res = await fetch(`${API_BASE_URL}/api/patient/${encodeURIComponent(idOrToken)}`);
    if (!res.ok) throw new Error('Patient not found');
    return await res.json();
  },

  /**
   * Save Edited Medical Summary & Doctor Notes
   */
  async saveSummary(payload) {
    const res = await fetch(`${API_BASE_URL}/api/save-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(extractErrorMessage(errorData, 'Failed to update summary'));
    }
    return await res.json();
  },

  /**
   * Get Receptionist Live Queue Statistics
   */
  async getReceptionistStats() {
    const res = await fetch(`${API_BASE_URL}/api/receptionist/stats`);
    if (!res.ok) throw new Error('Failed to fetch receptionist stats');
    return await res.json();
  },

  /**
   * Get PDF Download URL
   */
  getPdfUrl(idOrToken) {
    return `${API_BASE_URL}/api/patient/${encodeURIComponent(idOrToken)}/pdf`;
  }
};
