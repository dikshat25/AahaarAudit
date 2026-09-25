import React, { useState } from 'react';
import { Upload, Truck, AlertOctagon } from 'lucide-react';

const SUPPLIERS = [
  { name: 'Shree Dairy Co.', category: 'Dairy', lastDelivery: '2026-09-18', anomaly: false },
  { name: 'Metro Wholesale', category: 'Grocery / Staples', lastDelivery: '2026-09-15', anomaly: false },
  { name: 'FreshMeat Supplies', category: 'Meat & Poultry', lastDelivery: '2026-09-10', anomaly: true },
];

const INVOICES = [
  { id: 'INV-5521', supplier: 'Shree Dairy Co.', date: '2026-09-18', amount: '₹8,400', status: 'Matched' },
  { id: 'INV-5498', supplier: 'FreshMeat Supplies', date: '2026-09-10', amount: '₹22,000', status: 'Anomaly Detected' },
  { id: 'INV-5461', supplier: 'Metro Wholesale', date: '2026-09-15', amount: '₹31,750', status: 'Matched' },
];

export default function OwnerSuppliersTab() {
  const [invoices] = useState(INVOICES);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#0A2647] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#0A2647]/50" /> Suppliers
          </h3>
        </div>
        <div className="divide-y divide-[#0A2647]/8">
          {SUPPLIERS.map((s) => (
            <div key={s.name} className="py-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0A2647]">{s.name}</p>
                <p className="text-xs text-[#0A2647]/50">{s.category} · last delivery {s.lastDelivery}</p>
              </div>
              {s.anomaly && (
                <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" /> Anomaly flagged
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#0A2647]">Invoices</h3>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0A2647] border border-[#0A2647]/20 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#0A2647]/5">
            <Upload className="w-3.5 h-3.5" /> Upload Invoice
            <input type="file" className="hidden" />
          </label>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#0A2647]/40 text-xs uppercase">
              <th className="pb-2">Invoice</th>
              <th className="pb-2">Supplier</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0A2647]/8">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="py-2 font-mono text-xs text-[#0A2647]">{inv.id}</td>
                <td className="py-2 text-[#0A2647]/70">{inv.supplier}</td>
                <td className="py-2 text-[#0A2647]/70">{inv.date}</td>
                <td className="py-2 text-[#0A2647]/70">{inv.amount}</td>
                <td className="py-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    inv.status === 'Matched'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
