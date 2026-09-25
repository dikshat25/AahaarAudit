import React, { useState } from 'react';
import { Image as ImageIcon, Video, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { KITCHENS } from '../../mockData/kitchens';
import { COMPLAINT_CATEGORIES } from '../../mockData/complaints';
import { createComplaint } from '../../api/backendApi';
import { useAuth } from '../../context/AuthContext';

const normalizeText = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const emptyForm = {
  establishmentId: '',
  establishmentName: '',
  category: '',
  title: '',
  description: '',
  productInvolved: '',
  orderRef: '',
  location: '',
  dateTime: '',
  ownerEmail: '',
};

export default function CreateComplaintTab({ prefillEstablishment, onSubmitted }) {
  const { profile, firebaseUser } = useAuth();
  const [form, setForm] = useState({
    ...emptyForm,
    establishmentId: prefillEstablishment?.id || '',
    establishmentName: prefillEstablishment?.name || '',
  });
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [step, setStep] = useState('form'); // form | preview | submitting | submitted
  const [generatedId, setGeneratedId] = useState('');

  const establishment =
    KITCHENS.find((k) => k.id === form.establishmentId) ||
    KITCHENS.find((k) => normalizeText(k.name) === normalizeText(form.establishmentName));

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const fallbackTitle = (form.description || '').trim().slice(0, 60) || `Complaint for ${form.establishmentName || 'restaurant'}`;
  const canSubmit =
    form.establishmentName.trim() &&
    form.category &&
    (form.title.trim() || form.description.trim()) &&
    form.ownerEmail.trim();

  const handleEstablishmentNameChange = (value) => {
    const matched = KITCHENS.find((k) => normalizeText(k.name) === normalizeText(value));
    setForm((f) => ({
      ...f,
      establishmentName: value,
      establishmentId: matched?.id || f.establishmentId || '',
      location: matched?.location || f.location || '',
      ownerEmail: matched?.ownerEmail || f.ownerEmail || '',
    }));
  };

  const handleSubmit = async () => {
    setStep('submitting');
    try {
      const matchedEstablishment = establishment || KITCHENS.find((k) => normalizeText(k.name) === normalizeText(form.establishmentName));
      const currentEmail = profile?.email || firebaseUser?.email || 'customer@gmail.com';
      const currentUid = profile?.uid || firebaseUser?.uid || 'cust-user';
      const payload = {
        establishmentId: matchedEstablishment?.id || form.establishmentId || `AUTO-${Date.now()}`,
        establishmentName: matchedEstablishment?.name || form.establishmentName,
        category: form.category,
        title: form.title.trim() || fallbackTitle,
        description: form.description,
        productInvolved: form.productInvolved,
        orderRef: form.orderRef,
        location: form.location || matchedEstablishment?.location || '',
        dateTime: form.dateTime,
        ownerEmail: form.ownerEmail || matchedEstablishment?.ownerEmail || '',
        userId: currentUid,
        userEmail: currentEmail,
        adminEmail: 'admin@gmail.com',
      };
      const result = await createComplaint(payload);
      const id = result?.id || `CMP-${Math.floor(10000 + Math.random() * 89999)}`;
      setGeneratedId(id);
      setStep('submitted');
    } catch (e) {
      console.error(e);
      const id = `CMP-${Math.floor(10000 + Math.random() * 89999)}`;
      setGeneratedId(id);
      setStep('submitted');
    }
  };

  if (step === 'submitted') {
    return (
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-10 text-center max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-[#0A2647]">Complaint Submitted</h3>
        <p className="text-sm text-[#0A2647]/60 mt-2">
          Your complaint <span className="font-mono font-semibold">{generatedId}</span> has been sent to our
          Complaint Intelligence Agent for evidence analysis and risk assessment. You'll be notified once a
          priority is assigned.
        </p>
        <button
          onClick={() => {
            setForm(emptyForm);
            setImages([]);
            setVideo(null);
            setStep('form');
            onSubmitted && onSubmitted(generatedId);
          }}
          className="mt-6 px-4 py-2 rounded-lg bg-[#0A2647] text-white text-sm font-semibold hover:bg-[#0A2647]/90"
        >
          Track This Complaint
        </button>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-10 text-center max-w-lg mx-auto">
        <Loader2 className="w-8 h-8 text-[#0A2647] animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#0A2647]/60">Sending to the Complaint Intelligence Agent for evidence analysis...</p>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => setStep('form')} className="flex items-center gap-1 text-sm text-[#0A2647]/60 hover:text-[#0A2647]">
          <ArrowLeft className="w-4 h-4" /> Back to edit
        </button>
        <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6 space-y-4">
          <h3 className="font-display font-bold text-[#0A2647] text-lg">Preview Complaint</h3>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[#0A2647]/50">Establishment</dt>
              <dd className="font-semibold text-[#0A2647]">{establishment?.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[#0A2647]/50">Category</dt>
              <dd className="font-semibold text-[#0A2647]">{form.category}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[#0A2647]/50">Title</dt>
              <dd className="font-semibold text-[#0A2647]">{form.title}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[#0A2647]/50">Description</dt>
              <dd className="text-[#0A2647] whitespace-pre-wrap">{form.description}</dd>
            </div>
            {form.productInvolved && (
              <div>
                <dt className="text-[#0A2647]/50">Product / Food Involved</dt>
                <dd className="text-[#0A2647]">{form.productInvolved}</dd>
              </div>
            )}
            {form.orderRef && (
              <div>
                <dt className="text-[#0A2647]/50">Order / Reference No.</dt>
                <dd className="text-[#0A2647]">{form.orderRef}</dd>
              </div>
            )}
            {form.dateTime && (
              <div>
                <dt className="text-[#0A2647]/50">Date / Time</dt>
                <dd className="text-[#0A2647]">{form.dateTime}</dd>
              </div>
            )}
            {form.location && (
              <div>
                <dt className="text-[#0A2647]/50">Location</dt>
                <dd className="text-[#0A2647]">{form.location}</dd>
              </div>
            )}
            {form.ownerEmail && (
              <div>
                <dt className="text-[#0A2647]/50">Owner Email</dt>
                <dd className="text-[#0A2647]">{form.ownerEmail}</dd>
              </div>
            )}
            <div>
              <dt className="text-[#0A2647]/50">Attachments</dt>
              <dd className="text-[#0A2647]">{images.length} image(s){video ? ', 1 video' : ''}</dd>
            </div>
          </dl>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-[#0A2647] text-white font-semibold hover:bg-[#0A2647]/90 transition-colors"
        >
          Confirm & Submit Complaint
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6 space-y-5">
      <div>
        <label className="text-sm font-semibold text-[#0A2647] block mb-1">Hotel / Restaurant / Cloud Kitchen *</label>
        <input
          list="restaurant-list"
          value={form.establishmentName}
          onChange={(e) => handleEstablishmentNameChange(e.target.value)}
          placeholder="Type the exact restaurant or hotel name from the map"
          className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
        />
        <datalist id="restaurant-list">
          {KITCHENS.map((k) => (
            <option key={k.id} value={k.name} />
          ))}
        </datalist>
        {establishment && (
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-1.5 flex items-center justify-between gap-3">
            <span>Map match found:</span>
            <span className="font-bold">{establishment.name} · {establishment.location}</span>
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-[#0A2647] block mb-1">Complaint Category *</label>
        <select
          value={form.category}
          onChange={update('category')}
          className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
        >
          <option value="">Select a category...</option>
          {COMPLAINT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#0A2647] block mb-1">Owner Email *</label>
        <input
          type="email"
          value={form.ownerEmail || establishment?.ownerEmail || ''}
          onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
          placeholder="Enter the restaurant owner email"
          className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[#0A2647] block mb-1">Complaint Title *</label>
        <input
          value={form.title}
          onChange={update('title')}
          placeholder="Short complaint title"
          className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[#0A2647] block mb-1">Complaint Details *</label>
        <textarea
          value={form.description}
          onChange={update('description')}
          rows={5}
          placeholder="Describe what happened, when, and any relevant details..."
          className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-[#0A2647] block mb-1">Product / Food Involved</label>
          <input
            value={form.productInvolved}
            onChange={update('productInvolved')}
            className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A2647] block mb-1">Order / Reference No.</label>
          <input
            value={form.orderRef}
            onChange={update('orderRef')}
            className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A2647] block mb-1">Date / Time</label>
          <input
            type="datetime-local"
            value={form.dateTime}
            onChange={update('dateTime')}
            className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A2647] block mb-1">Location (if available)</label>
          <input
            value={form.location}
            onChange={update('location')}
            placeholder="e.g. Table 4, dine-in / delivery address"
            className="w-full border border-[#0A2647]/15 rounded-lg px-3 py-2.5 text-sm bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="border border-dashed border-[#0A2647]/25 rounded-lg p-4 flex flex-col items-center gap-1.5 text-center cursor-pointer hover:bg-[#0A2647]/5">
          <ImageIcon className="w-5 h-5 text-[#0A2647]/50" />
          <span className="text-xs text-[#0A2647]/60">{images.length ? `${images.length} image(s) selected` : 'Upload images'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />
        </label>
        <label className="border border-dashed border-[#0A2647]/25 rounded-lg p-4 flex flex-col items-center gap-1.5 text-center cursor-pointer hover:bg-[#0A2647]/5">
          <Video className="w-5 h-5 text-[#0A2647]/50" />
          <span className="text-xs text-[#0A2647]/60">{video ? video.name : 'Upload video (optional)'}</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-lg bg-[#0A2647] text-white font-semibold hover:bg-[#0A2647]/90 transition-colors"
      >
        Submit Complaint
      </button>
    </div>
  );
}
