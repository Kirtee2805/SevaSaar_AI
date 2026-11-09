/**
 * ==============================================================================
 * SEVASAAR AI • MAIN APPLICATION SHELL & ROLE ROUTER (Vanilla JS)
 * ==============================================================================
 */

import { PatientWorkflow } from './patient.js';
import { ReceptionistDashboard } from './receptionist.js';
import { DoctorDashboard } from './doctor.js';

class App {
  constructor() {
    this.currentRole = 'patient';
    this.isEmergencyActive = false;
    this.patientWorkflow = null;
    this.receptionistDashboard = null;
    this.doctorDashboard = null;
  }

  init() {
    this.bindHeaderNav();
    this.renderRoleView('patient');
  }

  bindHeaderNav() {
    const brandHome = document.getElementById('brand-home');
    if (brandHome) {
      brandHome.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchRole('patient');
        if (this.patientWorkflow) {
          this.patientWorkflow.reset();
          this.patientWorkflow.setStep(1);
        }
      });
    }

    const roleButtons = document.querySelectorAll('.role-pill-btn');
    roleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const role = btn.getAttribute('data-role');
        if (role) this.switchRole(role);
      });
    });
  }

  switchRole(role) {
    if (this.currentRole === role) return;

    // Clean up previous view if needed
    if (this.currentRole === 'receptionist' && this.receptionistDashboard) {
      this.receptionistDashboard.destroy();
    }

    this.currentRole = role;

    // Update active class on header pills
    document.querySelectorAll('.role-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-role') === role) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderRoleView(role);
  }

  renderRoleView(role) {
    const mainView = document.getElementById('main-view-container');
    if (!mainView) return;

    mainView.innerHTML = '';

    if (role === 'patient') {
      this.patientWorkflow = new PatientWorkflow(mainView, (isEmergency) => {
        this.setEmergencyState(isEmergency);
      });
      this.patientWorkflow.init();
    } else if (role === 'receptionist') {
      this.receptionistDashboard = new ReceptionistDashboard(mainView);
      this.receptionistDashboard.init();
    } else if (role === 'doctor') {
      this.doctorDashboard = new DoctorDashboard(mainView);
      this.doctorDashboard.init();
    }
  }

  setEmergencyState(isEmergency) {
    this.isEmergencyActive = Boolean(isEmergency);
    const emergencyBtn = document.getElementById('header-emergency-btn');
    if (emergencyBtn) {
      if (this.isEmergencyActive) {
        emergencyBtn.classList.remove('hidden');
      } else {
        emergencyBtn.classList.add('hidden');
      }
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.sevasaarApp = new App();
  window.sevasaarApp.init();
});
