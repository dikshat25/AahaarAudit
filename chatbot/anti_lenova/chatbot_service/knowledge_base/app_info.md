# Aahaar-Audit: Advanced Food Safety Intelligence Platform

## What is Aahaar-Audit?
Aahaar-Audit is an AI-powered, multi-agent food safety compliance platform built for India's food regulatory ecosystem. It automates inspections using computer vision, multi-agent AI debate, and real-time risk scoring — serving three types of users: Customers, Hotel/Restaurant Owners, and Government Admins (Food Safety Officers).

---

## 🔑 User Roles & Access

### 1. Customer (Public User)
- Register/login at the portal with email and password.
- Submit food safety complaints about restaurants, hotels, or food stalls.
- Track the real-time status of their complaints (Pending → Under Review → Inspection Completed).
- View their complaint history in "My Complaints" tab.
- Browse the regulatory feed (Admin Complaints) to see food safety actions in their area.
- Update their profile (name, phone, address).

### 2. Hotel/Restaurant Owner
- Login with their registered owner account.
- View complaints filed against their establishment.
- Acknowledge complaints and submit responses/action taken notes.
- Retrieve their AI-generated Scorecard (food safety score) by entering their CMP-ID (Complaint/Establishment ID).
- Upload kitchen/food prep images for AI-powered inspection in the "AI Monitoring & Debates" tab.
- View detailed AI violation reports and multi-agent debate outcomes for their establishment.
- Manage their business profile (business name, type, FSSAI license, address).

### 3. Admin (Food Safety Officer / Government Inspector)
- Full access to all complaints from all establishments.
- Assign complaints to inspectors, change status, add notes.
- Run live AI vision inspections by uploading images — triggers YOLO detection + multi-agent compliance debate.
- View AI-generated scorecards and detailed inspection reports for any establishment.
- Access the AI debate transcript (Prosecution, Defense, and Judge agent deliberations).
- See food safety rankings of all monitored establishments.
- Browse all filed reports in the Reports tab, searchable by CMP-ID.
- Full alert management (mark alerts as read).

---

## 🤖 AI Agents & Features

### Live Vision Inspection (YOLO + AI)
- Upload a kitchen or food preparation image/frame.
- The YOLOv11 computer vision model scans for violations: missing hairnets, no gloves, no masks, raw food cross-contamination, improper storage.
- Results appear instantly with detected objects, confidence scores, and matched safety rules.

### Multi-Agent Compliance Debate
When a violation is detected (or ambiguous), 3 AI agents debate the finding:
- **Prosecution Agent (Food Security)**: Argues for why this is a violation.
- **Defense Agent (Risk Assessment)**: Challenges the evidence and looks for mitigating factors.
- **Judge Agent**: Reviews both sides, weighs the arguments, and delivers a final verdict (violation / clear).
This prevents false positives and ensures fair, well-reasoned compliance decisions.

### AI Scorecard
- After an inspection, a food safety scorecard is generated.
- Score is 0–100. Grade: A (≥80), B (≥60), C (<60).
- Tracks hygiene, storage, temperature management, pest control, and more.

### Product Traceability (Anti-Lenova Agent)
- Verify product barcodes, supplier registrations, manufacturing and expiry dates.
- Flags expired products, unregistered suppliers, and counterfeit items.

### Inventory Verification
- Cross-reference inventory items against safe supplier databases.
- Flags items from blacklisted or unregistered suppliers.

### Risk Ranking
- All monitored establishments are ranked by their cumulative risk score.
- Helps regulators prioritize physical on-site inspections.

### Inspection Copilot
- AI-generated smart inspection checklist tailored to the establishment's detected violations.
- Helps inspectors know exactly what to look for during a physical visit.

---

## 📋 How to Use — Step by Step

### How to Submit a Complaint (Customer)
1. Log in as a Customer.
2. Go to "Submit Complaint" tab.
3. Fill in: Establishment Name, Complaint Category (hygiene/food quality/safety hazard/etc.), Title, and Description.
4. Click Submit. Your complaint gets a unique Complaint ID.
5. Track it in "My Complaints" — watch the status update as the admin reviews and inspects.

### How to Run an AI Inspection (Admin)
1. Log in as Admin.
2. Go to "Complaints" tab → Open a complaint.
3. Click "Start AI Inspection" — upload an image of the kitchen or food area.
4. Watch the live stream: YOLO detections appear first, then the 3-agent debate streams in real time.
5. After the debate completes, a scorecard and report are auto-generated and saved.
6. View the report in the "Reports" tab using the Complaint ID (CMP-ID).

### How to View My Scorecard (Owner)
1. Log in as Hotel Owner.
2. Go to "Scorecard" tab.
3. Enter your CMP-ID (Complaint ID associated with your establishment).
4. Click Retrieve — your AI-generated food safety scorecard will display.

### How to Check AI Monitoring (Owner)
1. Log in as Hotel Owner.
2. Go to "AI Monitoring & Debates" tab.
3. Enter your Establishment ID and select a complaint.
4. Upload a kitchen image and start the live AI inspection.
5. The multi-agent debate will stream in real time, followed by your updated score.

### How to Track My Complaint (Customer)
1. Log in as Customer.
2. Go to "My Complaints" tab.
3. All your submitted complaints appear with current status and last updated time.
4. Click a complaint to see any admin notes or inspector feedback.

---

## ❓ Frequently Asked Questions

**Q: What is a CMP-ID?**
A: CMP-ID stands for Complaint ID. It is the unique identifier assigned to your complaint when you submit it. Format example: `CMP-2024-abc12345`. You can use it to retrieve scorecards and reports.

**Q: How long does an AI inspection take?**
A: The YOLO scan is near-instant (2–5 seconds). The multi-agent debate takes 30–90 seconds depending on the AI providers. Total: roughly 1–2 minutes.

**Q: What violations can the system detect?**
A: Missing hairnets, no gloves, no face masks, raw food cross-contamination, improper food storage, pest presence, temperature violations, and general hygiene non-compliance.

**Q: What is the food safety score grading?**
A: Score 80–100 = Grade A (Excellent), Score 60–79 = Grade B (Acceptable), Score below 60 = Grade C (Requires immediate action).

**Q: Can customers see the results of inspections?**
A: Customers can see the status of their complaint and admin-filed regulatory actions in the "Admin Complaints" feed. Detailed technical inspection reports are currently visible to admins and owners.

**Q: What is FSSAI?**
A: FSSAI stands for Food Safety and Standards Authority of India. It is the government body that regulates food safety in India. Aahaar-Audit aligns with FSSAI compliance standards.

**Q: How do I register as an Owner or Admin?**
A: Contact your Food Safety Department administrator. Owner and Admin accounts are provisioned with assigned roles. Customers can self-register at the portal.

**Q: What does "Pending" complaint status mean?**
A: Pending means your complaint has been submitted and received but not yet reviewed by a Food Safety Officer.

**Q: What does "Under Review" status mean?**
A: The complaint has been picked up by an inspector and is being reviewed. An AI inspection may be in progress.

**Q: What does "Inspection Completed" status mean?**
A: The AI inspection (and possibly a physical visit) is done. A scorecard and report have been generated.

**Q: Can I edit my complaint after submission?**
A: No. Once submitted, complaints are locked for audit integrity. You can submit a new complaint with additional information.

**Q: What happens if the AI makes a wrong decision?**
A: The multi-agent debate is specifically designed to minimize false positives. However, every AI decision can be reviewed by a human Food Safety Officer who has override authority.

**Q: Is my data secure?**
A: Yes. All data is stored in Firebase Firestore with secure authentication. Passwords are managed by Firebase Auth and never stored in plain text.

**Q: How do I contact support?**
A: For technical support, contact the Aahaar-Audit administrator at your district Food Safety office. For app issues, use this chat assistant.

**Q: What browsers are supported?**
A: Aahaar-Audit works on Chrome, Firefox, Edge, and Safari (latest versions). Mobile browsers are also supported.

**Q: How do I logout?**
A: Click your profile icon in the top-right corner of the dashboard and select "Logout".

**Q: What is the Anti-Lenova Traceability System?**
A: Anti-Lenova is the product traceability module of Aahaar-Audit. It verifies food product authenticity by checking barcodes against supplier databases, checking manufacturing and expiry dates, and flagging counterfeit or unsafe products.

**Q: I forgot my password. What do I do?**
A: Click "Forgot Password" on the login page. A password reset link will be sent to your registered email.

**Q: Can the system monitor live CCTV footage?**
A: Currently, Aahaar-Audit supports frame/image upload for inspection. Continuous live CCTV integration is on the roadmap.

**Q: What AI models power the agents?**
A: The agents use Groq (Llama), Google Gemini, and Requesty (fallback) via an intelligent LLM gateway that automatically failovers between providers.

**Q: How are establishments ranked?**
A: Establishments are ranked by their cumulative risk score — a weighted combination of violation severity, frequency, and recency. Lower risk score = safer establishment = higher rank.
