# SevaSaar AI (सेवासार) • Multilingual Patient Intake & OPD Triage Portal

**SevaSaar AI** is a lightweight, AI-powered multilingual patient intake and triage management portal designed for hospitals, OPD clinics, and rural Primary Healthcare Centers (PHCs) in India.

It empowers patients to describe their symptoms in **Gujarati**, **Hindi**, **English**, or **Mixed Languages (Hinglish/Gujlish)** via natural voice input or manual typing. SevaSaar AI extracts structured clinical facts for doctors, flags missing information, and instantly evaluates deterministic emergency rules to prioritize acute patients in the OPD queue.

---

## ⚠️ Important Clinical Safety & Boundaries
- **NO Medical Diagnosis:** SevaSaar AI does NOT diagnose any disease, syndrome, or medical condition.
- **NO Medicine Prescriptions:** SevaSaar AI does NOT recommend, adjust, or prescribe any medication or dosage.
- **NO Treatment Plans:** SevaSaar AI does NOT generate clinical protocols or therapeutic interventions.
- **Deterministic Emergency Priority:** Emergency alerts operate on rule-based keyword matching that runs independently of LLM outputs and can never be overridden by AI responses.
- **Purpose:** Administrative intake structuring, multilingual translation, missing clinical information alerts, and rapid emergency triage flags for human medical staff.

---

## 🛠️ Technology Stack (Migrated Architecture)

### **Frontend**
- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+ Modules)
- **Speech Recognition:** Native Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Communication:** Standard Fetch API
- **Styling & Animations:** Custom CSS custom properties, responsive grid/flexbox layouts, CSS `@keyframes`
- **Zero Frontend Frameworks:** No React, No Next.js, No Node.js, No Tailwind CSS, No Webpack runtime overhead.

### **Backend**
- **Runtime:** Python 3.11+
- **Web Framework:** FastAPI (Async ASGI) & Uvicorn
- **Data Validation:** Pydantic v2
- **Database & ORM:** SQLite with SQLAlchemy 2.0 ORM (`database/dev.db`)
- **PDF Document Engine:** ReportLab

### **AI & Machine Learning**
- **LLM Inference:** Google Gemma / Gemini models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemma-2-9b-it`)
- **Orchestration:** LangChain (`langchain-core`, `langchain-google-genai`, `google-genai`)
- **Safety Engine:** Deterministic Multilingual Regex & Semantic Emergency Rule Engine (`emergency_rules.py`)
- **NLP & Script Identification:** Unicode script range classification and multilingual text normalization

---

## 📁 Project Directory Structure

```
sevasaar-AI/
├── frontend/                     # Pure HTML5, CSS3, Vanilla JS
│   ├── index.html                # Unified Application Shell & Role Switcher
│   ├── patient/
│   │   ├── index.html            # Step 1: Welcome Screen
│   │   ├── language.html         # Step 2: Language Selection (gu, hi, en, mixed)
│   │   ├── details.html          # Step 3: Patient Demographics Form
│   │   ├── complaint.html        # Step 4: Voice & Manual Text Intake
│   │   ├── processing.html       # Step 5: AI Extraction Animation
│   │   ├── summary.html          # Step 6: Clinical Summary Review & Edit
│   │   └── token.html            # Step 7: OPD Token Ticket Confirmation
│   ├── receptionist/
│   │   └── dashboard.html        # Live OPD Queue & Quick Correction Console
│   ├── doctor/
│   │   └── dashboard.html        # Clinical Triage, Missing Info & Doctor Notes
│   ├── css/
│   │   ├── global.css            # Design tokens, variables, typography, utilities
│   │   ├── patient.css           # Patient intake step styling & animations
│   │   ├── receptionist.css      # Reception queue table & filters
│   │   └── doctor.css            # Doctor split-view layout & clinical cards
│   └── js/
│       ├── app.js                # Global role router & header/footer mounting
│       ├── api.js                # Centralized Fetch API client for backend
│       ├── speech.js             # Browser Web Speech API controller
│       ├── language.js           # Multilingual prompts & dictionary
│       ├── patient.js            # 7-step intake form controller
│       ├── receptionist.js       # Queue auto-polling & search/status filters
│       └── doctor.js             # Doctor inspection, inline edit, notes & PDF
│
├── backend/                      # Python 3.11+ / FastAPI
│   ├── app/
│   │   ├── main.py               # FastAPI application entry, CORS, static mounting
│   │   ├── config.py             # Settings (Pydantic Settings, paths, API keys)
│   │   ├── api/
│   │   │   ├── patients.py       # CRUD endpoints for patient queue
│   │   │   ├── receptionist.py   # Receptionist stats & queue controls
│   │   │   ├── doctor.py         # Doctor updates & PDF generator endpoint
│   │   │   ├── generate_summary.py # Core AI extraction endpoint
│   │   │   └── language.py       # Language detection & normalization
│   │   ├── services/
│   │   │   ├── gemma_service.py  # Gemma/Gemini LLM inference & fallback
│   │   │   ├── extraction_service.py # Clinical entity extraction
│   │   │   ├── language_service.py # Multilingual detection & script classifier
│   │   │   └── normalization_service.py # Unicode & whitespace cleaner
│   │   ├── chains/
│   │   │   └── patient_intake_chain.py # LangChain PromptTemplate & safety rules
│   │   ├── safety/
│   │   │   └── emergency_rules.py# Deterministic multilingual safety engine
│   │   ├── schemas/
│   │   │   ├── patient.py        # Pydantic schemas for patient requests/responses
│   │   │   └── summary.py        # Pydantic schemas for clinical summary
│   │   ├── database/
│   │   │   ├── connection.py     # SQLAlchemy engine, session maker, Base
│   │   │   ├── models.py         # SQLAlchemy Patient model
│   │   │   └── seed_data.py      # Initial realistic multilingual patient seeder
│   │   └── utils/
│   │       └── pdf_generator.py  # ReportLab PDF intake generator
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Production container deployment
│   └── .env.example              # Environment configuration template
│
├── database/
│   └── dev.db                    # Persistent SQLite database file
│
├── tests/
│   ├── test_emergency_rules.py   # Emergency safety rule evaluation tests
│   ├── test_language.py          # Multilingual script & language detection tests
│   ├── test_extraction.py        # Clinical fact extraction tests
│   ├── test_api.py               # FastAPI endpoint tests (TestClient)
│   └── test_patient_workflow.py  # End-to-end patient lifecycle test
│
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.11 or higher**
- Any modern web browser (Google Chrome, Microsoft Edge, Brave, or Safari for Web Speech API support)

### 2. Install Dependencies
```bash
cd sevasaar-AI
pip install -r backend/requirements.txt
```

### 3. Environment Configuration (Optional for Live Gemini/Gemma)
The portal runs out-of-the-box in local development with deterministic fallback parsing. To enable live Google GenAI / Gemma LLM calls:
```bash
cp backend/.env.example backend/.env
```
Add your Google GenAI API key:
```env
GOOGLE_API_KEY="your-gemini-or-gemma-api-key"
GEMMA_MODEL_NAME="gemini-2.5-flash"
```

### 4. Start the Application
Run the unified FastAPI server:
```bash
cd sevasaar-AI
python run.py
```
Or double-click `run.bat` on Windows.
Open **`http://localhost:8000`** in your browser.

---

## 🧪 Running Automated Tests
Execute the complete test suite:
```bash
cd sevasaar-AI
python -m pytest tests/ -v
```
All 20 test cases will execute:
- Deterministic multilingual emergency condition triggers (Chest Pain, Bleeding, Syncope, Stroke, Trauma, Seizures)
- Language script classification (Gujarati, Hindi, English, Mixed)
- Structured intake fact extraction
- CRUD operations, OPD token sequence generation, and queue priority ordering
- Full end-to-end patient lifecycle from complaint to doctor PDF export

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and version check |
| `POST` | `/api/detect-language` | Detects language code (`gu`, `hi`, `en`, `mixed`) & BCP-47 tag |
| `POST` | `/api/normalize-text` | Sanitizes whitespace, zero-width characters, and Unicode NFC |
| `POST` | `/api/generate-summary` | Processes complaint through LangChain + Gemma and evaluates emergency rules |
| `POST` | `/api/patient` | Creates patient intake, issues token (`SEVA-XXX`), saves to SQLite |
| `GET` | `/api/patients` | Fetches OPD queue with `status` and `search` query parameters |
| `GET` | `/api/patient/{id}` | Retrieves patient record by UUID or Token Number |
| `POST` | `/api/save-summary` | Updates clinical summary, doctor notes, or OPD queue status |
| `GET` | `/api/patient/{id}/pdf` | Generates a formatted clinical intake summary PDF |
| `GET` | `/api/receptionist/stats`| Live statistics on Waiting, Emergency, and Completed patient counts |
