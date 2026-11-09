/**
 * ==============================================================================
 * SEVASAAR AI • RECEPTIONIST DASHBOARD CONTROLLER (Vanilla JS)
 * ==============================================================================
 */

import { ApiClient } from './api.js';

export class ReceptionistDashboard {
  constructor(containerElement) {
    this.container = containerElement;
    this.patients = [];
    this.stats = { total: 0, waiting: 0, emergency: 0, completed: 0 };
    this.statusFilter = 'All';
    this.searchQuery = '';
    this.isLoading = false;
    this.selectedPatient = null;
    this.autoRefreshInterval = null;
  }

  init() {
    this.render();
    this.fetchData();
    // Auto-refresh queue every 15 seconds
    this.autoRefreshInterval = setInterval(() => this.fetchData(false), 15000);
  }

  destroy() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  async fetchData(showSpinner = true) {
    if (showSpinner) this.isLoading = true;
    try {
      const [patientsRes, statsRes] = await Promise.all([
        ApiClient.getPatients(this.statusFilter, this.searchQuery),
        ApiClient.getReceptionistStats()
      ]);

      if (patientsRes && patientsRes.success) {
        this.patients = patientsRes.data;
      }
      if (statsRes && statsRes.success) {
        this.stats = statsRes.stats;
      }
    } catch (err) {
      console.error('[Receptionist] Failed to fetch queue:', err);
    } finally {
      this.isLoading = false;
      this.updateView();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="receptionist-dashboard animate-fade-in">
        <!-- Header -->
        <div class="reception-header">
          <div>
            <div class="reception-badge">👥 Hospital Reception Queue Control</div>
            <h2 class="reception-title">Receptionist Dashboard</h2>
            <p class="reception-subtitle">Monitor incoming patient intakes, edit summaries, and manage doctor triage assignments.</p>
          </div>

          <button type="button" id="btn-reception-refresh" class="btn-secondary" style="padding:0.6rem 1.25rem;">
            <span id="refresh-icon">🔄</span> Refresh Queue
          </button>
        </div>

        <!-- Stats Cards Grid -->
        <div class="reception-stats-grid">
          <div class="stat-card">
            <div>
              <div class="stat-label">Total Queue</div>
              <div class="stat-number" id="stat-total">0</div>
            </div>
            <div class="stat-icon-box" style="background:#eff6ff; color:#2563eb;">👥</div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Waiting for Doctor</div>
              <div class="stat-number" id="stat-waiting" style="color:#d97706;">0</div>
            </div>
            <div class="stat-icon-box" style="background:#fffbeb; color:#d97706;">⏳</div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Critical Emergency</div>
              <div class="stat-number" id="stat-emergency" style="color:#dc2626;">0</div>
            </div>
            <div class="stat-icon-box" style="background:#fef2f2; color:#dc2626;">⚠️</div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Consultations Done</div>
              <div class="stat-number" id="stat-completed" style="color:#059669;">0</div>
            </div>
            <div class="stat-icon-box" style="background:#ecfdf5; color:#059669;">✓</div>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="filter-search-bar">
          <div class="search-input-box">
            <span>🔍</span>
            <input type="text" id="reception-search-input" placeholder="Search by name, token (e.g. SEVA-001), phone, or complaint...">
          </div>

          <div class="status-filter-pills">
            ${['All', 'Waiting', 'Emergency', 'Completed'].map(status => `
              <button type="button" class="status-filter-btn ${this.statusFilter === status ? 'active' : ''}" data-filter="${status}">
                ${status}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Queue Table -->
        <div class="queue-table-card">
          <div class="table-responsive">
            <table class="queue-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient Details</th>
                  <th>Chief Complaint & Symptoms</th>
                  <th>Triage Status</th>
                  <th>Assigned Medical Officer</th>
                  <th>Intake Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="reception-table-body">
                <tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">Loading patient queue...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Edit Modal Container -->
        <div id="reception-modal-container"></div>
      </div>
    `;

    // Event listeners
    this.container.querySelector('#btn-reception-refresh').addEventListener('click', () => {
      this.fetchData(true);
    });

    const searchInput = this.container.querySelector('#reception-search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.fetchData(false);
    });

    this.container.querySelectorAll('.status-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.statusFilter = btn.getAttribute('data-filter');
        this.container.querySelectorAll('.status-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.fetchData(true);
      });
    });
  }

  updateView() {
    // Update stats counters
    const totalEl = this.container.querySelector('#stat-total');
    const waitingEl = this.container.querySelector('#stat-waiting');
    const emergencyEl = this.container.querySelector('#stat-emergency');
    const completedEl = this.container.querySelector('#stat-completed');

    if (totalEl) totalEl.textContent = this.stats.total;
    if (waitingEl) waitingEl.textContent = this.stats.waiting;
    if (emergencyEl) emergencyEl.textContent = this.stats.emergency;
    if (completedEl) completedEl.textContent = this.stats.completed;

    // Update table body
    const tbody = this.container.querySelector('#reception-table-body');
    if (!tbody) return;

    if (this.patients.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:3rem; color:var(--text-muted);">
            No patient intake records match the current filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.patients.map(patient => {
      const isEmergency = patient.status === 'Emergency';
      const createdDate = new Date(patient.createdAt);
      const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <tr class="${isEmergency ? 'row-emergency' : ''}">
          <td>
            <span class="token-badge">${patient.tokenNumber}</span>
          </td>
          <td>
            <div style="font-weight:800; color:var(--text-main);">${patient.details.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${patient.details.age} yrs / ${patient.details.gender} • ${patient.details.location}</div>
            <div style="font-size:0.75rem; color:var(--text-light);">${patient.details.phone}</div>
          </td>
          <td style="max-width:280px;">
            <div style="font-weight:700; color:#1e293b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${patient.summary.chiefComplaint}
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
              ${(patient.summary.symptoms || []).slice(0, 3).join(', ')}${(patient.summary.symptoms || []).length > 3 ? '...' : ''}
            </div>
          </td>
          <td>
            <span class="status-badge ${patient.status.toLowerCase()}">
              ${isEmergency ? '⚠️ EMERGENCY' : patient.status}
            </span>
          </td>
          <td style="font-size:0.8rem; font-weight:600; color:#334155;">
            ${patient.assignedDoctor || 'General OPD Doctor'}
          </td>
          <td style="font-size:0.775rem; color:var(--text-muted);">
            ${timeStr}
          </td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <button type="button" class="table-action-btn btn-edit-patient" data-id="${patient.id}">
                ✏️ Edit
              </button>
              <a href="/api/patient/${encodeURIComponent(patient.tokenNumber)}/pdf" target="_blank" class="table-action-btn" title="View PDF">
                📄
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click listeners to edit buttons
    tbody.querySelectorAll('.btn-edit-patient').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = this.patients.find(x => x.id === id);
        if (p) this.openEditModal(p);
      });
    });
  }

  openEditModal(patient) {
    const modalContainer = this.container.querySelector('#reception-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <div style="font-size:0.75rem; color:var(--primary-emerald); font-weight:800;">RECEPTION QUICK CORRECTION</div>
              <h3>Edit ${patient.details.name} (${patient.tokenNumber})</h3>
            </div>
            <button type="button" id="modal-close-btn" class="modal-close-btn">✕</button>
          </div>

          <form id="form-reception-edit">
            <div class="form-group">
              <label class="form-label">Chief Clinical Complaint</label>
              <textarea id="modal-complaint-input" class="form-textarea" rows="3">${patient.summary.chiefComplaint}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">OPD Queue Status</label>
              <select id="modal-status-select" class="form-select">
                <option value="Waiting" ${patient.status === 'Waiting' ? 'selected' : ''}>Waiting</option>
                <option value="Emergency" ${patient.status === 'Emergency' ? 'selected' : ''}>Emergency</option>
                <option value="Completed" ${patient.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>

            <div class="step-actions-row" style="margin-top:1.5rem;">
              <button type="button" id="modal-cancel-btn" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary" style="background:#059669;">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };

    modalContainer.querySelector('#modal-close-btn').addEventListener('click', close);
    modalContainer.querySelector('#modal-cancel-btn').addEventListener('click', close);

    modalContainer.querySelector('#form-reception-edit').addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedComplaint = modalContainer.querySelector('#modal-complaint-input').value.trim();
      const updatedStatus = modalContainer.querySelector('#modal-status-select').value;

      try {
        await ApiClient.saveSummary({
          patientId: patient.id,
          summary: { chiefComplaint: updatedComplaint },
          status: updatedStatus,
          userRole: 'receptionist'
        });
        close();
        this.fetchData(true);
      } catch (err) {
        alert('Failed to update: ' + err.message);
      }
    });
  }
}
