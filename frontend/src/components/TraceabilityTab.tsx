import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, ArrowRight, Package, Truck, Store, AlertTriangle, ArrowDown, ScanBarcode, CheckCircle } from 'lucide-react';
export default function TraceabilityTab() {
  const [formData, setFormData] = useState({
    kitchen_id: 'KITCHEN-221',
    barcode: '',
    product_name: 'Paneer Block',
    brand: 'Amul',
    manufacture_date: '2023-01-01',
    expiry_date: '2024-01-01',
    supplier_name: 'Fresh Farms',
    batch_number: 'BATCH-001',
  });
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
        message: data.status === 'clear' ? 'Product verified successfully.' : 'Product flagged for compliance issues!'
      });
    } catch (err) {
      setBarcodeResult({ status: 'error', message: 'Failed to connect to verification service.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-emerald-950 mb-4">Anti-Lenova Product Verification</h2>
        
        {/* Barcode Verification Section */}
        <form onSubmit={handleVerifyBarcode} className="mb-6 p-6 border border-emerald-200 rounded-lg bg-emerald-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Barcode (Required)</label>
              <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" placeholder="e.g. 890123456789" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Supplier Name</label>
              <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Expiry Date</label>
              <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Manufacture Date</label>
              <input type="date" name="manufacture_date" value={formData.manufacture_date} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Product Name</label>
              <input type="text" name="product_name" value={formData.product_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Batch Number</label>
              <input type="text" name="batch_number" value={formData.batch_number} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">Kitchen ID</label>
              <input type="text" name="kitchen_id" value={formData.kitchen_id} onChange={handleInputChange} required className="w-full px-3 py-2 border border-emerald-200 rounded bg-white text-emerald-900 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron" />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isVerifying}
            className="w-full bg-[#0A2647] hover:bg-[#153C6E] text-white px-4 py-3 rounded font-bold transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isVerifying ? 'Verifying Detailed Origin...' : 'Run Detailed Verification'}
          </button>
          {barcodeResult && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-3 p-3 rounded-md text-sm font-medium flex items-center gap-2 border ${
                barcodeResult.status === 'valid' || barcodeResult.status === 'clear'
                  ? 'bg-brand-green/10 text-brand-green border-brand-green/30' 
                  : 'bg-red-500/10 text-red-600 border-red-500/30'
              }`}
            >
              {(barcodeResult.status === 'valid' || barcodeResult.status === 'clear') ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <div className="flex-1">
                <p className="font-bold">{barcodeResult.message}</p>
                {barcodeResult.flags && barcodeResult.flags.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-semibold text-red-800">Flag Breakdown:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                      {barcodeResult.flags.includes('expired') && (
                        <li><span className="font-bold">Expired:</span> This product expired {Math.abs(barcodeResult.details?.expiry?.days_remaining || 0)} days ago. Do not use.</li>
                      )}
                      {barcodeResult.flags.includes('expiring_soon') && (
                        <li><span className="font-bold">Expiring Soon:</span> This product will expire in {barcodeResult.details?.expiry?.days_remaining} days. Monitor closely.</li>
                      )}
                      {barcodeResult.flags.includes('unregistered_supplier') && (
                        <li><span className="font-bold">Unregistered Supplier:</span> The supplier "{formData.supplier_name}" is not found in the approved registry. Possible counterfeit or unauthorized source.</li>
                      )}
                      {barcodeResult.flags.includes('incomplete_data') && (
                        <li><span className="font-bold">Missing Information:</span> The following required fields are missing: {barcodeResult.details?.completeness?.missing_fields?.join(', ')}.</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {barcodeResult.explanation && (
                  <div className="mt-4 p-3 bg-white/50 border border-emerald-200/50 rounded text-sm text-emerald-950 font-medium">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Agent Analysis</p>
                    <div dangerouslySetInnerHTML={{ __html: barcodeResult.explanation.replace(/\n/g, '<br/>') }} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
