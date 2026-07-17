import React from 'react';
import { Database, Cpu } from 'lucide-react';

export default function ArchitectureTab() {
  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-emerald-950 mb-2">Platform Architecture (Under the Hood)</h2>
        <p className="text-emerald-600">Technical implementation details for the multi-agent regulatory intelligence platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Datasets Table */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-emerald-950">Datasets & Knowledge Base</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-mono text-emerald-600 uppercase bg-white border-b border-emerald-200">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Domain</th>
                  <th className="px-4 py-3 rounded-tr-lg">Data Source / Training Set</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700 text-emerald-800">
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Person/Object Detection</td>
                  <td className="px-4 py-3">COCO, Open Images</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">PPE Detection</td>
                  <td className="px-4 py-3">Custom-annotated kitchen images (Gloves, Hairnets)</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Hand-Washing/Activity</td>
                  <td className="px-4 py-3">Custom video datasets (Action Recognition)</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Food/Expiry OCR</td>
                  <td className="px-4 py-3">Food-101, Open Food Facts</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Pest Detection</td>
                  <td className="px-4 py-3">Custom-annotated imagery</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">IoT Streams</td>
                  <td className="px-4 py-3">Simulated telemetry + Public temperature datasets</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Regulatory Knowledge Base</td>
                  <td className="px-4 py-3">FSSAI regulations, audit checklists (RAG indexed)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ML Pipeline Table */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-6 h-6 text-brand-green" />
            <h3 className="text-xl font-bold text-emerald-950">ML/DL & LLM Pipeline</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-mono text-emerald-600 uppercase bg-white border-b border-emerald-200">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Capability</th>
                  <th className="px-4 py-3 rounded-tr-lg">Model / Framework</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700 text-emerald-800">
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Hygiene Detection</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">YOLOv11 / RT-DETR / Grounding DINO</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">OCR (Invoices/Labels)</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">PaddleOCR / EasyOCR</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Product Verification</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">CNN + OCR + Barcode Matcher</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Complaint Analysis</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">Multilingual BERT + LLM Sentiment</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Risk Prediction</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">XGBoost / LightGBM / Temporal Fusion Transformer</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Traceability Graph</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">Neo4j + Graph Neural Networks (GNN)</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Regulatory Reasoning</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">LLM (GPT-4 / Claude) + RAG Pipeline</td>
                </tr>
                <tr className="hover:bg-white/80">
                  <td className="px-4 py-3 font-medium text-emerald-950">Multi-Agent Orchestration</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-600">CrewAI / LangGraph / AutoGen</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
