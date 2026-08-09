'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import apiClient from '../../../utils/api/apiClient';

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  annual_price: number | null;
  max_rfqs: number;
  max_saved_vendors: number;
  ai_recommendations: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  is_active: boolean;
  order: number;
}

interface PlanFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  annual_price: number | null;
  max_rfqs: number;
  max_saved_vendors: number;
  ai_recommendations: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  is_active: boolean;
  order: number;
}

const emptyPlan: PlanFormData = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  annual_price: null,
  max_rfqs: -1,
  max_saved_vendors: -1,
  ai_recommendations: false,
  priority_support: false,
  advanced_analytics: false,
  api_access: false,
  is_active: true,
  order: 0,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(emptyPlan);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/plans');
      setPlans(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData(emptyPlan);
    setShowModal(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await apiClient.delete(`/admin/plans/${id}`);
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await apiClient.put(`/admin/plans/${editingPlan.id}`, formData);
      } else {
        await apiClient.post('/admin/plans', formData);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Save failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name.includes('price') || name === 'max_rfqs' || name === 'max_saved_vendors' || name === 'order'
            ? Number(value)
            : value,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscription Plans</h1>
          <p className="text-slate-500 text-xs mt-1">Create, edit, and manage pricing plans</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold text-white transition shadow-md shadow-indigo-200"
        >
          <Plus size={15} /> New Plan
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Max RFQs</th>
              <th className="p-3">Saved Vendors</th>
              <th className="p-3">AI</th>
              <th className="p-3">Support</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">{plan.name}</td>
                <td className="p-3">${plan.price}</td>
                <td className="p-3">{plan.max_rfqs === -1 ? 'Unlimited' : plan.max_rfqs}</td>
                <td className="p-3">{plan.max_saved_vendors === -1 ? 'Unlimited' : plan.max_saved_vendors}</td>
                <td className="p-3">{plan.ai_recommendations ? <Check className="text-emerald-500 h-4 w-4" /> : <X className="text-slate-300 h-4 w-4" />}</td>
                <td className="p-3">{plan.priority_support ? <Check className="text-emerald-500 h-4 w-4" /> : <X className="text-slate-300 h-4 w-4" />}</td>
                <td className="p-3">{plan.is_active ? 'Yes' : 'No'}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(plan)} className="text-indigo-600 hover:text-indigo-800"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(plan.id)} className="text-rose-600 hover:text-rose-800"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">No plans yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Slug *</label>
                  <input name="slug" value={formData.slug} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Price</label>
                  <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Annual Price</label>
                  <input name="annual_price" type="number" value={formData.annual_price ?? ''} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Max RFQs</label>
                  <input name="max_rfqs" type="number" value={formData.max_rfqs} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Max Saved Vendors</label>
                  <input name="max_saved_vendors" type="number" value={formData.max_saved_vendors} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Description</label>
                  <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['ai_recommendations', 'priority_support', 'advanced_analytics', 'api_access', 'is_active'] as Array<keyof typeof formData>).map((field) => (
                  <label key={field} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input type="checkbox" name={field} checked={Boolean(formData[field])} onChange={handleChange} className="h-4 w-4" />
                    {field.replace('_', ' ')}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">{editingPlan ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}