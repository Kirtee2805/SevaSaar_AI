/**
 * ==============================================================================
 * SEVASAAR AI • PATIENT INTAKE WORKFLOW CONTROLLER (Vanilla JS)
 * ==============================================================================
 */

import { ApiClient } from './api.js';
import { SpeechController } from './speech.js';
import { LANGUAGES, detectScriptClient } from './language.js';

export class PatientWorkflow {
  constructor(containerElement, onEmergencyDetected) {
    this.container = containerElement;
    this.onEmergencyDetected = onEmergencyDetected;
    this.speech = new SpeechController();

    this.state = {
      step: 1, // 1: Welcome, 2: Language, 3: Details, 4: Complaint, 5: Loading, 6: Summary, 7: Token
      language: 'gu',
      details: {
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        location: ''
      },
      rawComplaint: '',
      speechTranscript: '',
      summary: null,
      createdRecord: null,
      isRecording: false,
      speechError: null,
      editingSection: null,
      newQuestionText: ''
    };
  }

  init() {
    this.render();
  }

  setStep(stepNumber) {
    this.state.step = stepNumber;
    this.speech.stop();
    this.state.isRecording = false;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'patient-flow-wrapper animate-fade-in';

    switch (this.state.step) {
      case 1:
        this.renderWelcome(wrapper);
        break;
      case 2:
        this.renderLanguageSelection(wrapper);
        break;
      case 3:
        this.renderDetailsForm(wrapper);
        break;
      case 4:
        this.renderComplaintInput(wrapper);
        break;
      case 5:
        this.renderLoading(wrapper);
        break;
      case 6:
        this.renderSummaryReview(wrapper);
        break;
      case 7:
        this.renderTokenConfirmation(wrapper);
        break;
      default:
        this.renderWelcome(wrapper);
    }

    this.container.appendChild(wrapper);
  }

  /* --------------------------------------------------------------------------
   * STEP 1: WELCOME SCREEN
   * -------------------------------------------------------------------------- */
  renderWelcome(wrapper) {
    wrapper.innerHTML = `
      <div class="welcome-hero animate-fade-in">
        <div class="step-indicator-pill">
          <span>✨</span>
          <span>Multilingual AI Patient Intake Assistant</span>
        </div>

        <h2>Describe Your Health Concerns in Your <span class="gradient-text">Native Language</span></h2>

        <p>SevaSaar AI converts your voice or text in Gujarati, Hindi, English, or Hinglish into a structured medical intake summary for your doctor.</p>

        <div class="lang-pills-row">
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-right:0.5rem;">Available Languages:</span>
          ${Object.values(LANGUAGES).map(lang => `
            <button class="lang-pill-btn ${this.state.language === lang.id ? 'active' : ''}" data-lang="${lang.id}">
              ${lang.nativeTitle} (${lang.title})
            </button>
          `).join('')}
        </div>

        <div>
          <button id="btn-start-intake" class="btn-primary-lg">
            <span>Start Patient Assessment</span>
            <span>➔</span>
          </button>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-card-icon" style="background:#eff6ff; color:#2563eb;">🗣️</div>
            <h3>Natural Voice or Text</h3>
            <p>Speak naturally in your preferred dialect or mix languages freely as spoken in daily life.</p>
          </div>

          <div class="feature-card">
            <div class="feature-card-icon" style="background:#ecfdf5; color:#059669;">🛡️</div>
            <h3>Emergency Rule Safety</h3>
            <p>Immediate automatic triage prioritization for chest pain, heavy bleeding, and trauma.</p>
          </div>

          <div class="feature-card">
            <div class="feature-card-icon" style="background:#f5f3ff; color:#7c3aed;">📋</div>
            <h3>Structured Doctor Summary</h3>
            <p>Organizes chief complaints, medications, allergies, and alerts missing information.</p>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    wrapper.querySelectorAll('.lang-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.language = btn.getAttribute('data-lang');
        this.render();
      });
    });

    wrapper.querySelector('#btn-start-intake').addEventListener('click', () => {
      this.setStep(2);
    });
  }

  /* --------------------------------------------------------------------------
   * STEP 2: LANGUAGE SELECTION
   * -------------------------------------------------------------------------- */
  renderLanguageSelection(wrapper) {
    wrapper.innerHTML = `
      <div class="step-header">
        <div class="step-indicator-pill">Step 1 of 4 • Language</div>
        <h2 class="step-title">Choose Your Preferred Language</h2>
        <p class="step-subtitle">Select the language in which you will describe your symptoms.</p>
      </div>

      <div class="languages-grid">
        ${Object.values(LANGUAGES).map(lang => {
          const isSelected = this.state.language === lang.id;
          return `
            <div class="lang-select-card ${isSelected ? 'selected' : ''}" data-lang="${lang.id}">
              <div class="lang-card-header">
                <div class="lang-card-left">
                  <span class="lang-flag">${lang.flag}</span>
                  <div>
                    <div class="lang-native-title">${lang.nativeTitle}</div>
                    <div class="lang-sub-title">${lang.title}</div>
                  </div>
                </div>
                <div class="lang-check-circle">
                  ${isSelected ? '✓' : ''}
                </div>
              </div>
              <p class="lang-desc">${lang.description}</p>
            </div>
          `;
        }).join('')}
      </div>

      <div class="step-actions-row">
        <button id="btn-back-step1" class="btn-secondary">
          <span>←</span> Back
        </button>
        <button id="btn-next-step3" class="btn-primary">
          Continue to Demographics <span>➔</span>
        </button>
      </div>
    `;

    wrapper.querySelectorAll('.lang-select-card').forEach(card => {
      card.addEventListener('click', () => {
        this.state.language = card.getAttribute('data-lang');
        this.render();
      });
    });

    wrapper.querySelector('#btn-back-step1').addEventListener('click', () => this.setStep(1));
    wrapper.querySelector('#btn-next-step3').addEventListener('click', () => this.setStep(3));
  }

  /* --------------------------------------------------------------------------
   * STEP 3: DEMOGRAPHICS FORM
   * -------------------------------------------------------------------------- */
  renderDetailsForm(wrapper) {
    wrapper.innerHTML = `
      <div class="step-header">
        <div class="step-indicator-pill">Step 2 of 4 • Demographics</div>
        <h2 class="step-title">Patient Demographics</h2>
        <p class="step-subtitle">Enter basic patient information to create your clinical intake token.</p>
      </div>

      <form id="form-patient-details" class="form-card">
        <div class="form-group">
          <label class="form-label">
            <span>👤</span> Full Name <span class="req-star">*</span>
          </label>
          <input type="text" id="input-name" class="form-input" required placeholder="e.g. Rameshbhai Patel / Sunita Sharma" value="${this.state.details.name}">
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">
              <span>📅</span> Age (Years) <span class="req-star">*</span>
            </label>
            <input type="number" id="input-age" class="form-input" min="1" max="120" required placeholder="e.g. 45" value="${this.state.details.age}">
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>👥</span> Gender <span class="req-star">*</span>
            </label>
            <select id="input-gender" class="form-select" required>
              <option value="Male" ${this.state.details.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${this.state.details.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other" ${this.state.details.gender === 'Other' ? 'selected' : ''}>Other</option>
              <option value="Prefer not to say" ${this.state.details.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">
              <span>📞</span> Mobile Phone Number <span class="req-star">*</span>
            </label>
            <input type="tel" id="input-phone" class="form-input" required placeholder="e.g. +91 98765 43210" value="${this.state.details.phone}">
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>📍</span> Village / Town / City <span class="req-star">*</span>
            </label>
            <input type="text" id="input-location" class="form-input" required placeholder="e.g. Anand, Gujarat" value="${this.state.details.location}">
          </div>
        </div>

        <div class="step-actions-row">
          <button type="button" id="btn-back-step2" class="btn-secondary">
            <span>←</span> Back
          </button>
          <button type="submit" class="btn-primary">
            Continue to Complaint Input <span>➔</span>
          </button>
        </div>
      </form>
    `;

    const form = wrapper.querySelector('#form-patient-details');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.state.details.name = wrapper.querySelector('#input-name').value.trim();
      this.state.details.age = wrapper.querySelector('#input-age').value.trim();
      this.state.details.gender = wrapper.querySelector('#input-gender').value;
      this.state.details.phone = wrapper.querySelector('#input-phone').value.trim();
      this.state.details.location = wrapper.querySelector('#input-location').value.trim();

      if (!this.state.details.name || !this.state.details.age || !this.state.details.phone || !this.state.details.location) {
        alert('Please fill out all required fields.');
        return;
      }
      this.setStep(4);
    });

    wrapper.querySelector('#btn-back-step2').addEventListener('click', () => this.setStep(2));
  }

  /* --------------------------------------------------------------------------
   * STEP 4: COMPLAINT SUBMISSION (VOICE & TEXT)
   * -------------------------------------------------------------------------- */
  renderComplaintInput(wrapper) {
    const langConfig = LANGUAGES[this.state.language] || LANGUAGES.en;
    const detected = detectScriptClient(this.state.rawComplaint);

    wrapper.innerHTML = `
      <div class="step-header">
        <div class="step-indicator-pill">Step 3 of 4 • Health Complaint</div>
        <h2 class="step-title">${langConfig.inputTitle}</h2>
        <p class="step-subtitle">You can speak using the microphone or type below.</p>
      </div>

      <div class="complaint-box-wrapper">
        <div class="speech-toolbar">
          <button type="button" id="btn-toggle-mic" class="mic-toggle-btn ${this.state.isRecording ? 'recording' : ''}">
            <span>${this.state.isRecording ? '⏹' : '🎤'}</span>
            <span>${this.state.isRecording ? 'Stop Recording' : 'Start Voice Input'}</span>
          </button>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="detected-lang-pill">
              🌐 Input Script: ${LANGUAGES[detected]?.title || 'Mixed / Multilingual'}
            </span>
            <button type="button" id="btn-sample-prompt" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.75rem;">
              Paste Sample Complaint
            </button>
          </div>
        </div>

        ${this.state.speechError ? `
          <div class="speech-error-banner">
            <span>⚠️</span>
            <span>${this.state.speechError}</span>
          </div>
        ` : ''}

        <textarea
          id="textarea-complaint"
          class="form-textarea"
          rows="6"
          placeholder="${langConfig.placeholder}"
        >${this.state.rawComplaint}</textarea>

        <div class="sample-prompts-box">
          <strong>Sample for ${langConfig.title}:</strong> "${langConfig.sample}"
        </div>

        <div class="step-actions-row">
          <button type="button" id="btn-back-step3" class="btn-secondary">
            <span>←</span> Back
          </button>
          <button type="button" id="btn-submit-ai" class="btn-primary" style="background:linear-gradient(90deg, #2563eb, #4f46e5, #059669);">
            <span>✨ Run AI Clinical Assessment ➔</span>
          </button>
        </div>
      </div>
    `;

    const textarea = wrapper.querySelector('#textarea-complaint');
    textarea.addEventListener('input', (e) => {
      this.state.rawComplaint = e.target.value;
    });

    const micBtn = wrapper.querySelector('#btn-toggle-mic');
    micBtn.addEventListener('click', () => {
      if (this.state.isRecording) {
        this.speech.stop();
        this.state.isRecording = false;
        this.render();
      } else {
        this.state.speechError = null;
        this.speech.start({
          language: this.state.language,
          initialText: this.state.rawComplaint,
          onResult: (fullText) => {
            this.state.rawComplaint = fullText;
            const liveTa = document.getElementById('textarea-complaint');
            if (liveTa) liveTa.value = fullText;
          },
          onError: (errMsg) => {
            this.state.speechError = errMsg;
            this.state.isRecording = false;
            this.render();
          },
          onEnd: () => {
            this.state.isRecording = false;
            this.render();
          }
        });
        this.state.isRecording = true;
        this.render();
      }
    });

    wrapper.querySelector('#btn-sample-prompt').addEventListener('click', () => {
      this.state.rawComplaint = langConfig.sample;
      this.render();
    });

    wrapper.querySelector('#btn-back-step3').addEventListener('click', () => this.setStep(3));

    wrapper.querySelector('#btn-submit-ai').addEventListener('click', () => {
      const text = this.state.rawComplaint.trim();
      if (!text || text.length < 3) {
        alert('Please describe your symptoms before proceeding.');
        return;
      }
      this.executeAiExtraction();
    });
  }

  /* --------------------------------------------------------------------------
   * STEP 5: AI PROCESSING ANIMATION
   * -------------------------------------------------------------------------- */
  renderLoading(wrapper) {
    wrapper.innerHTML = `
      <div class="processing-card animate-scale-up">
        <div class="processing-spinner-box"></div>
        <h2 style="font-size:1.5rem; font-weight:900; margin-bottom:0.5rem;">Extracting Clinical Intake Facts...</h2>
        <p style="font-size:0.875rem; color:var(--text-muted);">
          Gemma AI is structuring your symptoms, extracting duration, checking medicines, and evaluating emergency triage rules.
        </p>

        <div class="processing-steps-list">
          <div class="processing-step-item"><span>✓</span> Multilingual text normalized</div>
          <div class="processing-step-item"><span>✓</span> Language script identified</div>
          <div class="processing-step-item"><span>✓</span> Deterministic medical safety engine running...</div>
          <div class="processing-step-item"><span>✓</span> Formatting structured facts for doctor...</div>
        </div>
      </div>
    `;
  }

  async executeAiExtraction() {
    this.setStep(5);
    try {
      const hasValidDetails = Boolean(this.state.details && this.state.details.name && this.state.details.name.trim());
      const payload = {
        language: this.state.language,
        rawComplaint: this.state.rawComplaint
      };
      if (hasValidDetails) {
        payload.patientDetails = this.state.details;
      }
      if (this.state.speechTranscript && this.state.speechTranscript.trim()) {
        payload.speechTranscript = this.state.speechTranscript.trim();
      }

      const response = await ApiClient.generateSummary(payload);

      if (response && response.success) {
        this.state.summary = response.data;
        if (this.onEmergencyDetected) {
          this.onEmergencyDetected(response.data.emergency);
        }
        this.setStep(6);
      } else {
        alert('Failed to generate summary: ' + (response?.error || 'Unknown error'));
        this.setStep(4);
      }
    } catch (err) {
      console.error('[AI] Extraction error:', err);
      alert('Error connecting to AI service: ' + err.message);
      this.setStep(4);
    }
  }

  /* --------------------------------------------------------------------------
   * STEP 6: SUMMARY REVIEW & EDIT
   * -------------------------------------------------------------------------- */
  renderSummaryReview(wrapper) {
    const summary = this.state.summary;
    if (!summary) {
      this.setStep(4);
      return;
    }

    const isEmergency = summary.emergency;

    wrapper.innerHTML = `
      ${isEmergency ? `
        <div class="emergency-banner animate-fade-in">
          <div class="emergency-banner-top">
            <div style="display:flex; align-items:flex-start; gap:1rem;">
              <div class="emergency-icon-box">⚠️</div>
              <div class="emergency-banner-content">
                <div class="emergency-tag-row">
                  <span class="emergency-tag-white">Emergency Indicators Detected</span>
                  <span class="emergency-tag-dark">Immediate Priority</span>
                </div>
                <div class="emergency-title">${summary.emergencyReason || 'Immediate Medical Attention Recommended'}</div>
                <div class="emergency-subtitle">This is NOT a diagnosis. The emergency rule engine flagged these indicators for urgent human clinical triage.</div>
                ${summary.matchedRules && summary.matchedRules.length > 0 ? `
                  <div class="emergency-rules-list">
                    ${summary.matchedRules.map(r => `<span class="emergency-rule-badge">• ${r}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
            <a href="tel:108" class="emergency-call-cta">
              <span>📞</span> CALL EMERGENCY 108
            </a>
          </div>
        </div>
      ` : ''}

      <div class="summary-status-header">
        <div>
          <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em; color:#93c5fd; font-weight:800;">
            ✓ AI Extraction Complete
          </span>
          <h3 style="font-size:1.15rem; font-weight:900; margin-top:0.2rem;">Doctor Clinical Intake Summary</h3>
        </div>

        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span class="status-badge-item">🌐 ${LANGUAGES[this.state.language]?.title || 'Multilingual'}</span>
          <span class="status-badge-item">🤖 ${summary.modelUsed || 'Gemma AI'}</span>
          <button type="button" id="btn-download-pdf" class="btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.75rem; background:#ffffff;">
            <span>📄</span> Export PDF
          </button>
        </div>
      </div>

      <!-- Raw Patient Complaint Card -->
      <div class="summary-card" style="margin-bottom:1.25rem;">
        <div class="summary-card-header">
          <div class="summary-card-title"><span>📝</span> Original Patient Complaint</div>
          <span style="font-size:0.75rem; color:var(--text-muted);">${LANGUAGES[this.state.language]?.title}</span>
        </div>
        <p style="font-size:0.875rem; font-style:italic; color:#334155;">"${this.state.rawComplaint}"</p>
      </div>

      <!-- Structured Cards Grid -->
      <div class="summary-cards-grid">
        <!-- Chief Complaint -->
        <div class="summary-card">
          <div class="summary-card-header">
            <div class="summary-card-title"><span>🩺</span> Chief Complaint</div>
          </div>
          <p style="font-size:0.925rem; font-weight:800; color:var(--text-main);">${summary.chiefComplaint || 'Not recorded'}</p>
        </div>

        <!-- Symptoms & Duration -->
        <div class="summary-card">
          <div class="summary-card-header">
            <div class="summary-card-title"><span>⚡</span> Symptoms & Duration</div>
            <span style="font-size:0.75rem; font-weight:700; color:#2563eb;">${summary.duration || 'Unspecified'}</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.4rem;">
            ${(summary.symptoms || []).map(s => `
              <span class="symptom-tag" style="background:#eff6ff; color:#1d4ed8; padding:0.25rem 0.6rem; border-radius:6px; font-size:0.775rem; font-weight:700; border:1px solid #bfdbfe;">
                ${s}
              </span>
            `).join('') || '<span style="font-size:0.8rem; color:var(--text-muted);">None extracted</span>'}
          </div>
        </div>

        <!-- Current Medicines -->
        <div class="summary-card">
          <div class="summary-card-header">
            <div class="summary-card-title"><span>💊</span> Current Medicines</div>
          </div>
          <div style="font-size:0.825rem; color:var(--text-main);">
            ${(summary.currentMedicines || summary.medicines || []).join(', ') || 'None reported'}
          </div>
        </div>

        <!-- Conditions & Allergies -->
        <div class="summary-card">
          <div class="summary-card-header">
            <div class="summary-card-title"><span>🛡️</span> Conditions & Allergies</div>
          </div>
          <div style="font-size:0.825rem; color:var(--text-main); display:flex; flex-direction:column; gap:0.25rem;">
            <div>Conditions: <strong>${(summary.existingConditions || summary.conditions || []).join(', ') || 'None reported'}</strong></div>
            <div>Allergies: <strong style="color:#d97706;">${(summary.knownAllergies || summary.allergies || []).join(', ') || 'No known allergies'}</strong></div>
          </div>
        </div>
      </div>

      <!-- Missing Clinical Information Manager -->
      <div class="missing-questions-box">
        <div class="missing-questions-header">
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span>❓</span> RECOMMENDED CLINICAL QUESTIONS TO ASK PATIENT
          </div>
          <span>${(summary.missingInformation || summary.missing || []).length} Item(s)</span>
        </div>

        <div class="missing-items-chips">
          ${(summary.missingInformation || summary.missing || []).map((item, idx) => `
            <div class="missing-chip">
              <span>❓ Ask: ${item}</span>
              <button type="button" class="chip-remove-btn" data-remove-idx="${idx}">✕</button>
            </div>
          `).join('')}
        </div>

        <div class="add-missing-row">
          <input type="text" id="input-new-question" class="form-input" style="padding:0.5rem; font-size:0.8rem;" placeholder="Add question for doctor...">
          <button type="button" id="btn-add-question" class="btn-primary" style="padding:0.5rem 1rem; font-size:0.8rem; background:#d97706;">
            + Add
          </button>
        </div>
      </div>

      <!-- Safety Notice -->
      <div class="safety-notice-card" style="margin-bottom:1.5rem;">
        <div class="safety-notice-icon">🛡️</div>
        <div>
          <div class="safety-notice-title">Responsible AI & Clinical Safety Notice</div>
          <div class="safety-notice-text">
            This summary is generated for administrative intake structuring. It does not provide medical diagnosis, treatment recommendations, or prescriptions.
          </div>
        </div>
      </div>

      <div class="step-actions-row">
        <button type="button" id="btn-back-step4" class="btn-secondary">
          <span>←</span> Back to Edit
        </button>
        <button type="button" id="btn-confirm-intake" class="btn-primary" style="background:#059669; padding:0.9rem 2rem;">
          <span>✓ Confirm & Issue OPD Token ➔</span>
        </button>
      </div>
    `;

    // Missing questions management
    wrapper.querySelectorAll('.chip-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-remove-idx'));
        if (this.state.summary.missingInformation) {
          this.state.summary.missingInformation.splice(idx, 1);
        }
        if (this.state.summary.missing) {
          this.state.summary.missing.splice(idx, 1);
        }
        this.render();
      });
    });

    wrapper.querySelector('#btn-add-question').addEventListener('click', () => {
      const input = wrapper.querySelector('#input-new-question');
      const val = input.value.trim();
      if (!val) return;
      if (!this.state.summary.missingInformation) this.state.summary.missingInformation = [];
      this.state.summary.missingInformation.push(val);
      if (!this.state.summary.missing) this.state.summary.missing = [];
      this.state.summary.missing.push(val);
      this.render();
    });

    wrapper.querySelector('#btn-download-pdf').addEventListener('click', () => {
      window.open(`/api/patient/${encodeURIComponent(this.state.details.name)}/pdf`, '_blank');
    });

    wrapper.querySelector('#btn-back-step4').addEventListener('click', () => this.setStep(4));

    wrapper.querySelector('#btn-confirm-intake').addEventListener('click', () => {
      this.submitFinalIntake();
    });
  }

  async submitFinalIntake() {
    try {
      const payload = {
        language: this.state.language,
        details: this.state.details,
        rawComplaint: this.state.rawComplaint,
        summary: {
          chiefComplaint: this.state.summary.chiefComplaint,
          symptoms: this.state.summary.symptoms || [],
          duration: this.state.summary.duration || 'Unspecified',
          medicines: this.state.summary.currentMedicines || this.state.summary.medicines || [],
          conditions: this.state.summary.existingConditions || this.state.summary.conditions || [],
          allergies: this.state.summary.knownAllergies || this.state.summary.allergies || [],
          missing: this.state.summary.missingInformation || this.state.summary.missing || [],
          emergency: Boolean(this.state.summary.emergency),
          emergencyReason: this.state.summary.emergencyReason
        }
      };

      const res = await ApiClient.createPatient(payload);
      if (res && res.success) {
        this.state.createdRecord = res.data;
        this.setStep(7);
      } else {
        alert('Failed to submit intake: ' + (res?.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[Submit] Intake submission error:', err);
      alert('Error registering intake: ' + err.message);
    }
  }

  /* --------------------------------------------------------------------------
   * STEP 7: TOKEN CONFIRMATION TICKET
   * -------------------------------------------------------------------------- */
  renderTokenConfirmation(wrapper) {
    const record = this.state.createdRecord;
    if (!record) {
      this.setStep(1);
      return;
    }

    const isEmergency = record.status === 'Emergency';

    wrapper.innerHTML = `
      <div style="text-align:center; max-width:650px; margin:0 auto;" class="animate-scale-up">
        <div style="width:5rem; height:5rem; border-radius:50%; background:#dcfce7; color:#16a34a; font-size:2.5rem; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem;">
          ✓
        </div>

        <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.4rem;">Intake Assessment Submitted!</h2>
        <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1.5rem;">
          Your medical intake has been registered in the hospital database and sent to the reception queue and doctor console.
        </p>

        <!-- Token Ticket -->
        <div class="token-card">
          <div class="token-card-top">
            <div>
              <span class="token-grid-label">Patient Queue Token</span>
              <div class="token-number-large">${record.tokenNumber}</div>
            </div>
            <div style="font-size:2.5rem;">🎟️</div>
          </div>

          <div class="token-grid">
            <div>
              <span class="token-grid-label">Patient Name:</span>
              <span class="token-grid-val">${record.details.name}</span>
            </div>

            <div>
              <span class="token-grid-label">Triage Priority:</span>
              <span class="token-status-pill ${isEmergency ? 'token-status-emergency' : 'token-status-waiting'}">
                ${isEmergency ? '⚠️ IMMEDIATE EMERGENCY' : 'Standard OPD Queue'}
              </span>
            </div>

            <div>
              <span class="token-grid-label">Assigned Medical Officer:</span>
              <span class="token-grid-val" style="font-size:0.9rem;">${record.assignedDoctor || 'General OPD Doctor'}</span>
            </div>

            <div>
              <span class="token-grid-label">Estimated Wait Time:</span>
              <span class="token-grid-val" style="font-size:0.9rem;">
                ${isEmergency ? '0 mins (Immediate Entry)' : '~10-15 mins'}
              </span>
            </div>
          </div>

          <div class="token-note-box">
            <span>🏥</span>
            <span>Please take a seat in OPD Waiting Area. Your token number will be called on the display board.</span>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:1rem; margin-top:2rem; flex-wrap:wrap;">
          <button type="button" id="btn-return-home" class="btn-secondary">
            <span>🏠</span> Return to Welcome
          </button>
          <button type="button" id="btn-new-assessment" class="btn-primary">
            <span>+</span> New Patient Assessment
          </button>
        </div>
      </div>
    `;

    wrapper.querySelector('#btn-return-home').addEventListener('click', () => {
      this.reset();
      this.setStep(1);
    });

    wrapper.querySelector('#btn-new-assessment').addEventListener('click', () => {
      this.reset();
      this.setStep(2);
    });
  }

  reset() {
    this.state = {
      step: 1,
      language: 'gu',
      details: { name: '', age: '', gender: 'Male', phone: '', location: '' },
      rawComplaint: '',
      speechTranscript: '',
      summary: null,
      createdRecord: null,
      isRecording: false,
      speechError: null,
      editingSection: null,
      newQuestionText: ''
    };
    if (this.onEmergencyDetected) {
      this.onEmergencyDetected(false);
    }
  }
}
