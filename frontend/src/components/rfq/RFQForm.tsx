'use client';

import React, { useState } from 'react';
import { Send, Save, Sparkles, Upload, Eye, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '../../utils/api/apiClient';

const CATEGORIES = ['Apparel', 'Electronics', 'Metals', 'Chemicals', 'Machinery', 'Agriculture', 'Other'];
const UNITS = ['pcs', 'kg', 'meters', 'liters', 'boxes', 'rolls', 'sets'];
const PAYMENT_TERMS = ['Net 30', 'Net 60', 'Net 90', 'L/C', 'T/T 50/50', 'T/T 100%'];
const SHIPPING_METHODS = ['Sea Freight', 'Air Freight', 'Land Transport', 'Express'];

interface RFQFormProps {
  initialData?: any;
}

export default function RFQForm({ initialData }: RFQFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    product_name: initialData?.product_name || '',
    category: initialData?.category || '',
    quantity: initialData?.quantity || 0,
    unit: initialData?.unit || 'pcs',
    material: initialData?.material || '',
    budget: initialData?.budget || '',
    delivery_date: initialData?.delivery_date || '',
    payment_terms: initialData?.payment_terms || 'Net 30',
    shipping_method: initialData?.shipping_method || 'Sea Freight',
    description: initialData?.description || '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
  };

  const getErrorMessage = (err: any) => {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(', ');
    }
    return detail || 'Failed to save';
  };

  const handleAIGenerate = async () => {
    if (!formData.description) {
      setError('Please describe your requirement first, then click AI Generate.');
      return;
    }
    try {
      setAiLoading(true);
      setError(null);
      const res = await apiClient.post('/rfq/generate-ai', { description: formData.description });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setFormData(prev => ({
          ...prev,
          product_name: res.data.product_name || prev.product_name,
          category: res.data.category || prev.category,
          quantity: Number(res.data.quantity) || prev.quantity,
          unit: res.data.unit || prev.unit,
          material: res.data.material || prev.material,
          budget: res.data.budget || prev.budget,
          payment_terms: res.data.payment_terms || prev.payment_terms,
          shipping_method: res.data.shipping_method || prev.shipping_method,
          delivery_date: res.data.delivery_date || prev.delivery_date,
        }));
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  const uploadAttachments = async (rfqId: number) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post(`/rfq/${rfqId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError(null);
    const payload = {
    ...formData,
    quantity: Number(formData.quantity)
};

      let rfqId = initialData?.id;
      if (rfqId) {
        await apiClient.put(`/rfq/${rfqId}`, payload);
      } else {
        const res = await apiClient.post('/rfq', payload);
        rfqId = res.data.id;
      }

      if (files.length > 0 && rfqId) {
        await uploadAttachments(rfqId);
      }

      router.push('/rfq');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = { ...formData, quantity: Number(formData.quantity), status: 'sent' };

      let rfqId = initialData?.id;
      if (rfqId) {
        await apiClient.put(`/rfq/${rfqId}`, payload);
      } else {
        const res = await apiClient.post('/rfq', payload);
        rfqId = res.data.id;
      }

      await apiClient.post(`/rfq/${rfqId}/send`);

      if (files.length > 0 && rfqId) {
        await uploadAttachments(rfqId);
      }

      setSent(true);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">RFQ Sent Successfully!</h2>
        <p className="text-sm text-slate-500">Your request has been sent to suppliers.</p>
        <button
          onClick={() => router.push('/rfq')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
        >
          View All RFQs
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* AI Generate */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAIGenerate}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {aiLoading ? 'Generating...' : 'AI Generate RFQ'}
        </button>
        <span className="text-[11px] text-slate-400">Enter description below, then AI fills the form.</span>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-[11px] font-bold text-slate-600 uppercase">Requirement Description (for AI)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            placeholder="e.g., Need 10,000 cotton t-shirts for summer, ISO certified manufacturer, budget $15,000"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Product Name *</label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Select</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Unit *</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Material / Specs</label>
          <input
            type="text"
            name="material"
            value={formData.material}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Budget (USD)</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Delivery Date</label>
          <input
            type="date"
            name="delivery_date"
            value={formData.delivery_date}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Payment Terms</label>
          <select
            name="payment_terms"
            value={formData.payment_terms}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {PAYMENT_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase">Shipping Method</label>
          <select
            name="shipping_method"
            value={formData.shipping_method}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {SHIPPING_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold text-slate-600 uppercase">Attachments</label>
        <div className="mt-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-indigo-400 transition-all">
          <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1">
            <Upload className="h-5 w-5 text-slate-400" />
            <span className="text-xs text-slate-500">Click to upload</span>
          </label>
        </div>
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, idx) => (
              <div key={idx} className="text-[10px] text-slate-500">{file.name}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" /> Save Draft
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !formData.product_name || !formData.category || !formData.quantity}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" /> Send RFQ
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-slate-900">RFQ Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400 font-bold">Product:</span> {formData.product_name}</div>
              <div><span className="text-slate-400 font-bold">Category:</span> {formData.category}</div>
              <div><span className="text-slate-400 font-bold">Qty:</span> {formData.quantity} {formData.unit}</div>
              <div><span className="text-slate-400 font-bold">Material:</span> {formData.material || '-'}</div>
              <div><span className="text-slate-400 font-bold">Budget:</span> ${formData.budget || 0}</div>
              <div><span className="text-slate-400 font-bold">Delivery:</span> {formData.delivery_date || '-'}</div>
              <div><span className="text-slate-400 font-bold">Payment:</span> {formData.payment_terms}</div>
              <div><span className="text-slate-400 font-bold">Shipping:</span> {formData.shipping_method}</div>
              <div className="col-span-2"><span className="text-slate-400 font-bold">Description:</span> {formData.description}</div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}