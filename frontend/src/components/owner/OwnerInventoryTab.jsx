import React from 'react';
import { AlertTriangle } from 'lucide-react';

const PRODUCTS = [
  { product: 'Paneer (Fresh)', brand: 'Amul', batch: 'B-4471', mfg: '2026-09-18', exp: '2026-09-25', qty: '12 kg', supplier: 'Shree Dairy Co.', status: 'Expiring Soon' },
  { product: 'Cooking Oil', brand: 'Fortune', batch: 'B-2201', mfg: '2026-06-01', exp: '2027-06-01', qty: '40 L', supplier: 'Metro Wholesale', status: 'Verified' },
  { product: 'Chicken (Frozen)', brand: 'Licious', batch: 'B-9981', mfg: '2026-09-10', exp: '2026-09-24', qty: '8 kg', supplier: 'FreshMeat Supplies', status: 'Expired' },
  { product: 'Basmati Rice', brand: 'India Gate', batch: 'B-1150', mfg: '2026-04-12', exp: '2027-04-12', qty: '25 kg', supplier: 'Metro Wholesale', status: 'Verified' },
  { product: 'Tomato Puree', brand: "Kissan", batch: 'B-3387', mfg: '2026-08-01', exp: '2027-02-01', qty: '15 kg', supplier: 'Metro Wholesale', status: 'Batch Mismatch' },
];

const STATUS_STYLES = {
  Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Expiring Soon': 'bg-amber-50 text-amber-700 border-amber-200',
  Expired: 'bg-red-50 text-red-700 border-red-200',
  'Batch Mismatch': 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function OwnerInventoryTab() {
  const warnings = PRODUCTS.filter((p) => p.status !== 'Verified');

  return (
    <div className="space-y-5">
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            {warnings.length} product(s) need attention: expired stock, items expiring soon, or a batch mismatch flagged by verification.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[#0A2647]/40 text-xs uppercase">
              <th className="pb-2">Product</th>
              <th className="pb-2">Brand</th>
              <th className="pb-2">Batch</th>
              <th className="pb-2">Mfg Date</th>
              <th className="pb-2">Expiry</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Supplier</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0A2647]/8">
            {PRODUCTS.map((p) => (
              <tr key={p.product + p.batch}>
                <td className="py-2.5 font-medium text-[#0A2647]">{p.product}</td>
                <td className="py-2.5 text-[#0A2647]/70">{p.brand}</td>
                <td className="py-2.5 text-[#0A2647]/70 font-mono text-xs">{p.batch}</td>
                <td className="py-2.5 text-[#0A2647]/70">{p.mfg}</td>
                <td className="py-2.5 text-[#0A2647]/70">{p.exp}</td>
                <td className="py-2.5 text-[#0A2647]/70">{p.qty}</td>
                <td className="py-2.5 text-[#0A2647]/70">{p.supplier}</td>
                <td className="py-2.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
