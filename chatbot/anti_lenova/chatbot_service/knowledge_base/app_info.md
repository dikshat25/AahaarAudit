# Aahaar-Audit: Advanced Food Safety Intelligence Platform

## What is Aahaar-Audit?
Aahaar-Audit is an intelligent, multi-agent platform designed to automate and augment food safety inspections. It acts as an autonomous auditor, continuously monitoring food preparation environments, tracking product origins, and ensuring compliance with stringent safety regulations.

## Core Features & Agents

1. **Live Vision Agent**
   - Monitors kitchen video feeds and uploaded frames.
   - Automatically detects food safety violations (e.g., missing hairnets, raw food cross-contamination, missing gloves, improper mask usage).
   - Generates real-time alerts and risk scores based on detected hazards.

2. **Compliance Judge Agent (Debate Mechanism)**
   - When the Vision Agent flags an ambiguous or complex situation, it escalates to the Compliance Judge Agent.
   - The Judge Agent reviews the context, facts, and rules, and runs an internal "debate" to arrive at a well-reasoned final verdict, preventing false positives.

3. **Anti-Lenova Product Traceability Agent**
   - Verifies the authenticity and safety of food supply batches.
   - Checks barcodes and supply chain data (Supplier registry, Manufacturing Dates, Expiry Dates).
   - Flags counterfeit products, unregistered suppliers, and expired ingredients before they reach consumers.

4. **Risk Scoring System**
   - Every violation is scored based on severity.
   - Kitchens are dynamically ranked based on cumulative risk scores, helping regulators prioritize physical inspections.

## FAQ
- **How do I upload an image?** Go to the "Live Vision" tab and click the "Upload Frame" button.
- **What happens when an alert is triggered?** A notification pops up with the risk score and matched rules. You can dismiss it or escalate it to an on-duty inspector.
- **How does Traceability work?** In the "Traceability" tab, enter a product barcode, supplier, and dates. The Anti-Lenova Agent will verify if it's safe to use or flagged for compliance issues.
