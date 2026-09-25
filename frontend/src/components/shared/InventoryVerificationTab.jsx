import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageSearch,
  ScanBarcode,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  AlertOctagon,
  Sparkles,
  Bot
} from 'lucide-react';

const INITIAL_PRODUCTS = [
  { product: 'Paneer (Fresh)', brand: 'Amul', batch: 'B-4471', mfg: '2026-09-18', exp: '2026-09-25', qty: '12 kg', supplier: 'Shree Dairy Co.', status: 'Expiring Soon' },
  { product: 'Cooking Oil', brand: 'Fortune', batch: 'B-2201', mfg: '2026-06-01', exp: '2027-06-01', qty: '40 L', supplier: 'Metro Wholesale', status: 'Verified' },
  { product: 'Chicken (Frozen)', brand: 'Licious', batch: 'B-9981', mfg: '2026-09-10', exp: '2026-09-24', qty: '8 kg', supplier: 'FreshMeat Supplies', status: 'Expired' },
  { product: 'Basmati Rice', brand: 'India Gate', batch: 'B-1150', mfg: '2026-04-12', exp: '2027-04-12', qty: '25 kg', supplier: 'Metro Wholesale', status: 'Verified' },
  { product: 'Tomato Puree', brand: 'Kissan', batch: 'B-3387', mfg: '2026-08-01', exp: '2027-02-01', qty: '15 kg', supplier: 'Metro Wholesale', status: 'Batch Mismatch' },
];

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

const STATUS_STYLES = {
  Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Expiring Soon': 'bg-amber-50 text-amber-700 border-amber-200',
  Expired: 'bg-red-50 text-red-700 border-red-200',
  'Batch Mismatch': 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function InventoryVerificationTab({ establishmentId = 'REST-001' }) {
  const [activeSubTab, setActiveSubTab] = useState('verify'); // 'verify' | 'inventory' | 'suppliers'
  const [products] = useState(INITIAL_PRODUCTS);

  // Form state for verification
  const [formData, setFormData] = useState({
    kitchen_id: establishmentId,
    barcode: '',
    product_name: 'Paneer Block',
    brand: 'Amul',
    manufacture_date: '2026-09-10',
    expiry_date: '2026-09-28',
    supplier_name: 'Fresh Farms',
    batch_number: 'BATCH-441',
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyBarcode = async (e) => {
    if (e) e.preventDefault();
    if (!formData.barcode) return;
    setIsVerifying(true);
    setBarcodeResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scanned_at: new Date().toISOString()
        })
      });
      const data = await response.json();
      setBarcodeResult({
        status: data.status,
        flags: data.flags,
        details: data.details,
        explanation: data.explanation,
        message: data.status === 'clear' ? 'Product verified as safe & compliant.' : 'Product flagged for compliance issues!'
      });
    } catch (err) {
      setBarcodeResult({ status: 'error', message: 'Failed to connect to verification backend service.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner with Sub-Navigation */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-[#0A2647] flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-[#FF9933]" /> Inventory, Products, Suppliers & Invoices Hub
            </h3>
            <p className="text-xs text-[#0A2647]/60 mt-0.5">
              Unified barcode origin verification, real-time expiry auditor, AI explainer agent, and supplier invoice reconciler.
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'verify', label: 'Product Verification', icon: ScanBarcode },
              { id: 'inventory', label: 'Inventory Stock', icon: PackageSearch },
              { id: 'suppliers', label: 'Suppliers & Invoices', icon: Truck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                    activeSubTab === tab.id
                      ? 'bg-[#0A2647] text-white shadow-sm'
                      : 'bg-[#F6F5F1] text-[#0A2647]/70 hover:bg-[#0A2647]/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SUB-TAB 1: PRODUCT VERIFICATION SYSTEM (Barcode + Expiry + Explainer Agent) ── */}
      {activeSubTab === 'verify' && (
        <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#0A2647]/10 pb-3">
            <div>
              <h4 className="font-display font-bold text-sm text-[#0A2647] flex items-center gap-2">
                <ScanBarcode className="w-4 h-4 text-emerald-700" /> Barcode & Safe Product Verification
              </h4>
              <p className="text-xs text-[#0A2647]/60">
                Enter product barcode, manufacturing date, and expiry date to evaluate safety status with the AI Explainer Agent.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded">
              AI Explainer Active
            </span>
          </div>

          <form onSubmit={handleVerifyBarcode} className="p-5 border border-[#0A2647]/10 rounded-xl bg-[#F6F5F1]/60 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Barcode *</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 890123456789 or 890103000000"
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Supplier Name *</label>
                <input
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Fresh Farms, Shree Dairy Co."
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Manufacture Date *</label>
                <input
                  type="date"
                  name="manufacture_date"
                  value={formData.manufacture_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Expiry Date *</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Product Name *</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Brand Name *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Batch / Lot Number</label>
                <input
                  type="text"
                  name="batch_number"
                  value={formData.batch_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A2647] mb-1">Establishment / Kitchen ID</label>
                <input
                  type="text"
                  name="kitchen_id"
                  value={formData.kitchen_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-white text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#0A2647] hover:bg-[#153C6E] text-white py-2.5 rounded-xl font-bold text-xs transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Product Safety & Consulting Explainer Agent...
                </>
              ) : (
                <>
                  <ScanBarcode className="w-4 h-4" /> Verify Product Safety & Reason
                </>
              )}
            </button>
          </form>

          {/* Verification Result Card & Explainer Agent */}
          {barcodeResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border ${
                barcodeResult.status === 'valid' || barcodeResult.status === 'clear'
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-red-50/70 border-red-300 text-red-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {barcodeResult.status === 'valid' || barcodeResult.status === 'clear' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h4 className="font-bold text-sm">
                  {barcodeResult.status === 'clear' || barcodeResult.status === 'valid'
                    ? 'SAFE TO USE: Product Verified'
                    : 'COMPLIANCE WARNING: Flagged Product'}
                </h4>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  barcodeResult.status === 'clear' || barcodeResult.status === 'valid'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-red-200 text-red-900'
                }`}>
                  Status: {barcodeResult.status}
                </span>
              </div>

              <p className="text-xs leading-relaxed">{barcodeResult.message}</p>

              {/* Explainer Agent Section */}
              {barcodeResult.explanation && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-[#0A2647]/10 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs border-b border-[#0A2647]/10 pb-2">
                    <Bot className="w-4 h-4 text-indigo-700" />
                    <span>AI Explainer Agent Assessment</span>
                  </div>
                  <div
                    className="text-[#0A2647]/80 leading-relaxed space-y-1.5"
                    dangerouslySetInnerHTML={{ __html: barcodeResult.explanation.replace(/\n/g, '<br/>') }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: INVENTORY STOCK TABLE ── */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6 overflow-x-auto">
            <h4 className="font-display font-bold text-sm text-[#0A2647] mb-3">
              Stock In Hand & Expiry Tracking
            </h4>
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="text-left text-[#0A2647]/40 uppercase border-b border-[#0A2647]/10">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Brand</th>
                  <th className="pb-2">Batch</th>
                  <th className="pb-2">Mfg Date</th>
                  <th className="pb-2">Expiry</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Supplier</th>
                  <th className="pb-2">Safety Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A2647]/8">
                {products.map((p) => (
                  <tr key={p.product + p.batch}>
                    <td className="py-2.5 font-bold text-[#0A2647]">{p.product}</td>
                    <td className="py-2.5 text-[#0A2647]/70">{p.brand}</td>
                    <td className="py-2.5 text-[#0A2647]/70 font-mono">{p.batch}</td>
                    <td className="py-2.5 text-[#0A2647]/70">{p.mfg}</td>
                    <td className="py-2.5 text-[#0A2647]/70">{p.exp}</td>
                    <td className="py-2.5 text-[#0A2647]/70">{p.qty}</td>
                    <td className="py-2.5 text-[#0A2647]/70">{p.supplier}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: SUPPLIERS & INVOICES ── */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
            <h4 className="font-display font-bold text-sm text-[#0A2647] mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF9933]" /> Approved Food Suppliers
            </h4>
            <div className="divide-y divide-[#0A2647]/8">
              {SUPPLIERS.map((s) => (
                <div key={s.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#0A2647]">{s.name}</p>
                    <p className="text-[#0A2647]/50">{s.category} · Last delivery {s.lastDelivery}</p>
                  </div>
                  {s.anomaly && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" /> Anomaly Flagged
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-bold text-sm text-[#0A2647]">Invoices & Match Logs</h4>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0A2647] border border-[#0A2647]/20 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#0A2647]/5">
                <Upload className="w-3.5 h-3.5" /> Upload Invoice
                <input type="file" className="hidden" />
              </label>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[#0A2647]/40 uppercase border-b border-[#0A2647]/10">
                  <th className="pb-2">Invoice ID</th>
                  <th className="pb-2">Supplier</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A2647]/8">
                {INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2 font-mono font-bold text-[#0A2647]">{inv.id}</td>
                    <td className="py-2 text-[#0A2647]/70">{inv.supplier}</td>
                    <td className="py-2 text-[#0A2647]/70">{inv.date}</td>
                    <td className="py-2 text-[#0A2647]/70 font-bold">{inv.amount}</td>
                    <td className="py-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
      )}
    </div>
  );
}
