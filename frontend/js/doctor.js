/**
 * ==============================================================================
 * SEVASAAR AI • DOCTOR DASHBOARD CONTROLLER (Vanilla JS)
 * ==============================================================================
 */

import { ApiClient } from './api.js';

export class DoctorDashboard {
  constructor(containerElement) {
    this.container = containerElement;
    this.patients = [];
    this.selectedPatient = null;
    this.doctorNotes = '';
    this.editingSection = null;
    this.newMissingQuestion = '';
  }

  async init() {
    this.renderShell();
    await this.fetchPatients();
  }

  async fetchPatients() {
    try {
      const res = await ApiClient.getPatients();
      if (res && res.success) {
        // Sort: Emergency first, then Waiting, then Completed
        const sorted = (res.data || []).sort((a, b) => {
          if (a.status === 'Emergency' && b.status !== 'Emergency') return -1;
          if (a.status !== 'Emergency' && b.status === 'Emergency') return 1;
          if (a.status === 'Waiting' && b.status === 'Completed') return -1;
          return 0;
        });
        this.patients = sorted;

        if (sorted.length > 0) {
          if (!this.selectedPatient || !sorted.find(p => p.id === this.selectedPatient.id)) {
            this.selectPatient(sorted[0]);
          } else {
            const updatedCurrent = sorted.find(p => p.id === this.selectedPatient.id);
            this.selectPatient(updatedCurrent);
          }
        } else {
          this.selectedPatient = null;
          this.renderConsole();
        }
        this.renderSidebar();
      }
    } catch (err) {
      console.error('[Doctor] Failed to fetch patient list:', err);
    }
  }

  selectPatient(patient) {
    this.selectedPatient = patient;
    this.doctorNotes = patient?.notes || '';
    this.editingSection = null;
    this.renderSidebar();
    this.renderConsole();
  }

  renderShell() {
    this.container.innerHTML = `
      <div class="doctor-dashboard animate-fade-in">
        <div class="doctor-layout-grid">
          <!-- Left Queue Sidebar -->
          <div class="doctor-sidebar">
            <div class="sidebar-header">
              <div class="sidebar-title">
                <span>🩺 OPD Triage Queue</span>
                <span id="queue-badge-count" class="token-badge">0</span>
              </div>
              <div class="sidebar-subtitle">Priority sorted (Emergencies float to top)</div>
            </div>
            <div class="patient-list-scroll" id="doctor-sidebar-list">
              <div style="text-align:center; padding:2rem; font-size:0.8rem; color:var(--text-muted);">
                Loading queue...
              </div>
            </div>
          </div>

          <!-- Right Clinical Inspection Console -->
          <div class="doctor-console" id="doctor-console-content">
            <div style="text-align:center; padding:4rem; color:var(--text-muted); background:#ffffff; border-radius:24px;">
              Select a patient from the queue to view their clinical intake.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSidebar() {
    const listContainer = this.container.querySelector('#doctor-sidebar-list');
    const badgeCount = this.container.querySelector('#queue-badge-count');
    if (!listContainer) return;

    if (badgeCount) badgeCount.textContent = `${this.patients.length} Patient(s)`;

    if (this.patients.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:2rem; font-size:0.8rem; color:var(--text-muted);">
          No patients in OPD queue.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.patients.map(p => {
      const isSelected = this.selectedPatient && this.selectedPatient.id === p.id;
      const isEmergency = p.status === 'Emergency';
      return `
        <div class="queue-patient-item ${isSelected ? 'selected' : ''} ${isEmergency ? 'is-emergency' : ''}" data-id="${p.id}">
          <div class="item-top-row">
            <span class="item-token">${p.tokenNumber}</span>
            <span class="status-badge ${p.status.toLowerCase()}">${isEmergency ? '⚠️ Emergency' : p.status}</span>
          </div>
          <div class="item-name">${p.details.name}</div>
          <div class="item-meta">${p.details.age} yrs / ${p.details.gender} • ${p.details.location}</div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.queue-patient-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const found = this.patients.find(x => x.id === id);
        if (found) this.selectPatient(found);
      });
    });
  }

  renderConsole() {
    const consoleContainer = this.container.querySelector('#doctor-console-content');
    if (!consoleContainer) return;

    const patient = this.selectedPatient;
    if (!patient) {
      consoleContainer.innerHTML = `
        <div style="text-align:center; padding:4rem; color:var(--text-muted); background:#ffffff; border-radius:24px;">
          Select a patient from the queue to review their clinical intake.
        </div>
      `;
      return;
    }

    const summary = patient.summary;
    const isEmergency = patient.status === 'Emergency' || summary.emergency;

    consoleContainer.innerHTML = `
      <!-- Demographics Top Card -->
      <div class="patient-profile-header-card animate-scale-up">
        <div class="profile-demographics">
          <div class="profile-avatar-box">
            <span style="font-size:1.75rem;">👤</span>
          </div>
          <div>
            <div class="profile-name-row">
              <span class="token-badge" style="font-size:0.85rem;">${patient.tokenNumber}</span>
              <h2 class="profile-name">${patient.details.name}</h2>
              <span class="status-badge ${patient.status.toLowerCase()}">${isEmergency ? '⚠️ EMERGENCY' : patient.status}</span>
            </div>
            <div class="profile-sub-details">
              <span>📅 ${patient.details.age} Years</span>
              <span>•</span>
              <span>👥 ${patient.details.gender}</span>
              <span>•</span>
              <span>📞 ${patient.details.phone}</span>
              <span>•</span>
              <span>📍 ${patient.details.location}</span>
            </div>
          </div>
        </div>

        <div class="console-actions-row">
          <button type="button" id="btn-doc-pdf" class="btn-doctor-action">
            <span>📄</span> Export PDF
          </button>
          <button type="button" id="btn-doc-print" class="btn-doctor-action">
            <span>🖨️</span> Print
          </button>
          <button type="button" id="btn-doc-complete" class="btn-doctor-action btn-mark-completed">
            <span>✓</span> Mark Completed
          </button>
        </div>
      </div>

      <!-- Emergency Alert Banner if Emergency -->
      ${isEmergency ? `
        <div class="emergency-banner">
          <div class="emergency-banner-top">
            <div style="display:flex; align-items:flex-start; gap:1rem;">
              <div class="emergency-icon-box">⚠️</div>
              <div class="emergency-banner-content">
                <div class="emergency-tag-row">
                  <span class="emergency-tag-white">PRIORITY TRIAGE ALERT</span>
                  <span class="emergency-tag-dark">Immediate Clinical Evaluation</span>
                </div>
                <div class="emergency-title">${summary.emergencyReason || 'Chest Pain + Breathing Difficulty / Acute Triage'}</div>
                <div class="emergency-subtitle">High-risk keywords matched deterministic emergency safety engine. Triage evaluation required.</div>
              </div>
            </div>
            <a href="tel:108" class="emergency-call-cta">
              <span>📞</span> CALL EMERGENCY 108
            </a>
          </div>
        </div>
      ` : ''}

      <!-- Original Patient Input -->
      <div class="raw-complaint-box">
        <div class="raw-complaint-title">Original Patient Description (${(patient.language || 'en').toUpperCase()})</div>
        <p class="raw-complaint-text">"${patient.rawComplaint}"</p>
      </div>

      <!-- Clinical Structured Sections Grid -->
      <div class="clinical-sections-grid">
        <!-- Chief Complaint -->
        <div class="clinical-card">
          <div class="clinical-card-header">
            <div class="clinical-card-title"><span>🩺</span> Chief Complaint</div>
            <button type="button" class="edit-btn btn-edit-section" data-section="chiefComplaint">✏️ Edit</button>
          </div>
          ${this.editingSection === 'chiefComplaint' ? `
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <textarea id="edit-val-complaint" class="form-textarea" rows="2">${summary.chiefComplaint}</textarea>
              <div style="display:flex; gap:0.4rem; justify-content:flex-end;">
                <button type="button" class="btn-secondary btn-cancel-edit" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Cancel</button>
                <button type="button" class="btn-primary btn-save-edit" style="padding:0.3rem 0.7rem; font-size:0.75rem;">Save</button>
              </div>
            </div>
          ` : `
            <div class="clinical-card-content" style="font-weight:800; font-size:0.95rem;">
              ${summary.chiefComplaint}
            </div>
          `}
        </div>

        <!-- Symptoms & Duration -->
        <div class="clinical-card">
          <div class="clinical-card-header">
            <div class="clinical-card-title"><span>⚡</span> Symptoms & Duration</div>
            <span style="font-size:0.75rem; font-weight:700; color:#2563eb;">${summary.duration || 'Unspecified'}</span>
          </div>
          <div class="clinical-card-content">
            <div class="symptoms-tags-row">
              ${(summary.symptoms || []).map(s => `
                <span class="symptom-tag">${s}</span>
              `).join('') || '<span style="font-size:0.8rem; color:var(--text-muted);">None reported</span>'}
            </div>
          </div>
        </div>

        <!-- Current Medicines -->
        <div class="clinical-card">
          <div class="clinical-card-header">
            <div class="clinical-card-title"><span>💊</span> Current Medicines</div>
            <button type="button" class="edit-btn btn-edit-section" data-section="medicines">✏️ Edit</button>
          </div>
          ${this.editingSection === 'medicines' ? `
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <input type="text" id="edit-val-medicines" class="form-input" value="${(summary.medicines || []).join(', ')}">
              <div style="display:flex; gap:0.4rem; justify-content:flex-end;">
                <button type="button" class="btn-secondary btn-cancel-edit" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Cancel</button>
                <button type="button" class="btn-primary btn-save-edit" style="padding:0.3rem 0.7rem; font-size:0.75rem;">Save</button>
              </div>
            </div>
          ` : `
            <div class="clinical-card-content">
              ${(summary.medicines || []).join(', ') || 'None reported'}
            </div>
          `}
        </div>

        <!-- Conditions & Allergies -->
        <div class="clinical-card">
          <div class="clinical-card-header">
            <div class="clinical-card-title"><span>🛡️</span> Conditions & Allergies</div>
          </div>
          <div class="clinical-card-content" style="display:flex; flex-direction:column; gap:0.3rem;">
            <div>Conditions: <strong>${(summary.conditions || []).join(', ') || 'None reported'}</strong></div>
            <div>Allergies: <strong style="color:#d97706;">${(summary.allergies || []).join(', ') || 'No known allergies'}</strong></div>
          </div>
        </div>
      </div>

      <!-- Missing Clinical Information Alert Box -->
      <div class="missing-questions-box">
        <div class="missing-questions-header">
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span>❓</span> RECOMMENDED CLINICAL QUESTIONS TO ASK PATIENT
          </div>
          <span>${(summary.missing || []).length} Item(s)</span>
        </div>

        <div class="missing-items-chips">
          ${(summary.missing || []).map((item, idx) => `
            <div class="missing-chip">
              <span>❓ Ask: ${item}</span>
              <button type="button" class="chip-remove-btn doc-chip-remove" data-idx="${idx}">✕</button>
            </div>
          `).join('')}
        </div>

        <div class="add-missing-row">
          <input type="text" id="doc-new-question-input" class="form-input" style="padding:0.5rem; font-size:0.8rem;" placeholder="Add question for patient interview...">
          <button type="button" id="btn-doc-add-question" class="btn-primary" style="padding:0.5rem 1rem; font-size:0.8rem; background:#d97706;">
            + Add Question
          </button>
        </div>
      </div>

      <!-- Doctor Consultation Notes & Prescription -->
      <div class="consultation-notes-box">
        <div class="consultation-notes-title">
          <span>✍️</span> Doctor Clinical Examination Notes & Prescription
        </div>
        <textarea
          id="doc-consultation-textarea"
          class="consultation-textarea"
          placeholder="Enter clinical examination findings, vitals (BP, SpO2, Pulse, Temp), clinical diagnosis, and prescription details..."
        >${this.doctorNotes}</textarea>

        <div style="display:flex; justify-content:flex-end; margin-top:0.6rem;">
          <button type="button" id="btn-save-notes" class="btn-primary" style="padding:0.5rem 1.25rem; font-size:0.8rem;">
            💾 Save Consultation Notes
          </button>
        </div>
      </div>

      <!-- Safety Notice -->
      <div class="safety-notice-card">
        <div class="safety-notice-icon">🛡️</div>
        <div>
          <div class="safety-notice-title">Responsible AI Safety Disclaimer</div>
          <div class="safety-notice-text">
            SevaSaar AI does not generate medical diagnoses or treatment plans. All clinical decisions remain strictly the responsibility of the attending medical officer.
          </div>
        </div>
      </div>

      <div class="doctor-footer-note">
        SevaSaar AI Triage Summary • Standard OPD Document Format • Signed by Attending Medical Officer
      </div>
    `;

    // Event listeners
    consoleContainer.querySelector('#btn-doc-pdf').addEventListener('click', () => {
      window.open(ApiClient.getPdfUrl(patient.tokenNumber), '_blank');
    });

    consoleContainer.querySelector('#btn-doc-print').addEventListener('click', () => {
      window.print();
    });

    consoleContainer.querySelector('#btn-doc-complete').addEventListener('click', async () => {
      if (confirm(`Mark consultation as COMPLETED for ${patient.details.name}?`)) {
        try {
          await ApiClient.saveSummary({
            patientId: patient.id,
            status: 'Completed',
            notes: this.doctorNotes,
            userRole: 'doctor'
          });
          await this.fetchPatients();
        } catch (err) {
          alert('Failed to update status: ' + err.message);
        }
      }
    });

    // Notes auto-tracking and save
    const notesTa = consoleContainer.querySelector('#doc-consultation-textarea');
    notesTa.addEventListener('input', (e) => {
      this.doctorNotes = e.target.value;
    });

    consoleContainer.querySelector('#btn-save-notes').addEventListener('click', async () => {
      try {
        await ApiClient.saveSummary({
          patientId: patient.id,
          notes: this.doctorNotes,
          userRole: 'doctor'
        });
        alert('Consultation notes saved successfully.');
        await this.fetchPatients();
      } catch (err) {
        alert('Failed to save notes: ' + err.message);
      }
    });

    // Section inline editing
    consoleContainer.querySelectorAll('.btn-edit-section').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editingSection = btn.getAttribute('data-section');
        this.renderConsole();
      });
    });

    const cancelEditBtn = consoleContainer.querySelector('.btn-cancel-edit');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        this.editingSection = null;
        this.renderConsole();
      });
    }

    const saveEditBtn = consoleContainer.querySelector('.btn-save-edit');
    if (saveEditBtn) {
      saveEditBtn.addEventListener('click', async () => {
        const updated = { ...patient.summary };
        if (this.editingSection === 'chiefComplaint') {
          updated.chiefComplaint = consoleContainer.querySelector('#edit-val-complaint').value.trim();
        } else if (this.editingSection === 'medicines') {
          updated.medicines = consoleContainer.querySelector('#edit-val-medicines').value.split(',').map(m => m.trim());
        }

        try {
          await ApiClient.saveSummary({
            patientId: patient.id,
            summary: updated,
            userRole: 'doctor'
          });
          this.editingSection = null;
          await this.fetchPatients();
        } catch (err) {
          alert('Failed to save section edit: ' + err.message);
        }
      });
    }

    // Missing questions add/remove
    consoleContainer.querySelectorAll('.doc-chip-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        patient.summary.missing.splice(idx, 1);
        try {
          await ApiClient.saveSummary({
            patientId: patient.id,
            summary: patient.summary,
            userRole: 'doctor'
          });
          this.renderConsole();
        } catch (err) {
          alert('Failed to update questions: ' + err.message);
        }
      });
    });

    consoleContainer.querySelector('#btn-doc-add-question').addEventListener('click', async () => {
      const input = consoleContainer.querySelector('#doc-new-question-input');
      const val = input.value.trim();
      if (!val) return;
      if (!patient.summary.missing) patient.summary.missing = [];
      patient.summary.missing.push(val);
      try {
        await ApiClient.saveSummary({
          patientId: patient.id,
          summary: patient.summary,
          userRole: 'doctor'
        });
        this.renderConsole();
      } catch (err) {
        alert('Failed to add question: ' + err.message);
      }
    });
  }
}
