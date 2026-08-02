# SevaSaar AI • Multilingual Patient Intake & Triage Portal

**SevaSaar AI (सेवासार)** is an AI-powered multilingual patient intake assistant designed for hospitals, OPD clinics, and rural primary healthcare centers (PHCs). 

It empowers patients to describe their health complaints in **Gujarati**, **Hindi**, **English**, or **Mixed Languages (Hinglish/Gujlish)** via text or natural speech input. SevaSaar AI processes the input and generates a structured clinical intake summary for doctors, while instantly checking automated emergency rules for critical triage prioritization.

---

## ⚠️ Important Safety & Boundaries
- **NO Medical Diagnosis:** SevaSaar AI does NOT diagnose any diseases or health conditions.
- **NO Medicine Prescriptions:** SevaSaar AI does NOT recommend, adjust, or prescribe any medications.
- **NO Treatment Plans:** SevaSaar AI does NOT generate clinical treatment protocols.
- **Purpose:** Administrative intake structuring, multilingual translation, missing information alerts, and rule-based emergency triage flags for human medical staff.

---

## 🛠️ Technology Stack
- **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI:** Tailwind CSS, Google Material / Stitch inspired UI tokens, Glassmorphism, Framer Motion
- **Icons & Visuals:** Lucide React
- **PDF Export:** jsPDF & html2canvas
- **Database & ORM:** SQLite with Prisma ORM (`prisma/schema.prisma`)
- **API Validation:** Zod Schema Validation

---

## 🤖 Gemma AI Integration Guide

The summary generation endpoint is currently powered by a mock JSON parser in `lib/mockData.ts` and `app/api/generate-summary/route.ts`. 

To connect **Google Gemma 2 / Gemma 3**:

1. **Install Google AI SDK**:
   ```bash
   npm install @google/genai
   ```

2. **Set Environment Variable**:
   ```env
   GEMMA_API_KEY="your-gemma-api-key"
   ```

3. **Update `app/api/generate-summary/route.ts`**:
   Replace the mock generator function with the Gemma API call:

   ```typescript
   import { GoogleGenAI } from '@google/genai';

   const genAI = new GoogleGenAI({ apiKey: process.env.GEMMA_API_KEY });

   const prompt = `
     You are a medical intake assistant for Indian hospital triage (Gujarati/Hindi/English).
     Task: Extract structured clinical facts from the patient's complaint text.
     
     STRICT SAFETY RULES:
     - DO NOT diagnose diseases.
     - DO NOT recommend treatment or medicines.
     - Extract only: Chief Complaint, Symptoms array, Duration, Existing Medicines, Existing Conditions, Known Allergies, and Missing Info.

     Patient Input: "${rawComplaint}"
     Language: "${language}"
   `;

   const response = await genAI.models.generateContent({
     model: 'gemma-2-9b-it', // or gemma-3
     contents: prompt,
     responseSchema: MedicalSummarySchema
   });

   const gemmaExtraction = JSON.parse(response.text);
   ```

---

## 🚨 Emergency Rule Safety Engine (`lib/emergencyRules.ts`)

The emergency rule engine runs automatically on both raw complaints and extracted symptoms. It checks for critical pre-defined keyword combinations (across Gujarati, Hindi, English, and Hinglish):

- **Chest Pain + Breathing Difficulty:** Flagged for immediate ECG / Cardiology Triage.
- **Heavy or Uncontrolled Bleeding:** Flagged for Trauma / Emergency Bay.
- **Loss of Consciousness / Fainting:** Flagged for Immediate Priority.
- **Stroke Symptoms:** Facial drooping, arm weakness, slurred speech.
- **Severe Head Trauma or Convulsions / Seizures.**

When triggered, the system displays:
> **⚠️ Immediate Professional Medical Attention Recommended**

---

## 📡 API Structure

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate-summary` | Processes patient complaint & returns extracted summary + emergency check |
| `POST` | `/api/patient` | Creates a new patient intake record with token number |
| `POST` | `/api/save-summary` | Updates patient summary or status (Receptionist / Doctor edit) |
| `GET` | `/api/patients` | Fetches patient queue with optional `status` & `search` filters |
| `GET` | `/api/patient/:id` | Returns single patient record by ID or Token Number |

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

## 👥 User Roles & Views
1. **Patient View:** 4-Step Intake flow (Welcome -> Language Selection -> Demographics -> Complaint Input -> AI Loading -> Review Summary -> Token Confirmation Ticket).
2. **Receptionist Dashboard:** Live OPD Queue, Token Tracking, Filter by Waiting/Emergency/Completed, Quick Edit Modal.
3. **Doctor Dashboard:** Priority Sorted Patient List, Detailed Summary Console, Missing Info Alert Box, Medical Timeline, PDF & Print Export.
