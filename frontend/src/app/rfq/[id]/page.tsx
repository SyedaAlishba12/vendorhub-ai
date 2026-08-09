'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Trash2, Download, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '../../../utils/api/apiClient';
import RFQStatusBadge from '../../../components/rfq/RFQStatusBadge';

export default function RFQDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRFQ = async () => {
    try {
      const res = await apiClient.get(`/rfq/${id}`);
      setRfq(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load RFQ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQ();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this RFQ?')) return;
    try {
      await apiClient.delete(`/rfq/${id}`);
      router.push('/rfq');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Delete failed');
    }
  };

  const handleSend = async () => {
    try {
      await apiClient.post(`/rfq/${id}/send`);
      fetchRFQ();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Send failed');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await apiClient.post(`/rfq/${id}/export-pdf`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RFQ-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('PDF export failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!rfq) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <Link href="/rfq" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-xs font-bold">
        <ArrowLeft className="h-4 w-4" /> Back to RFQs
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{rfq.product_name}</h1>
            <p className="text-xs text-slate-500 mt-1">{rfq.rfq_ref} · {rfq.category}</p>
          </div>
          <RFQStatusBadge status={rfq.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">Quantity</p><p className="text-sm font-bold text-slate-900">{rfq.quantity} {rfq.unit}</p></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">Budget</p><p className="text-sm font-bold text-slate-900">${rfq.budget || 0}</p></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">Delivery</p><p className="text-sm font-bold text-slate-900">{rfq.delivery_date?.slice(0,10) || 'N/A'}</p></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">Payment</p><p className="text-sm font-bold text-slate-900">{rfq.payment_terms}</p></div>
        </div>

        {rfq.material && (
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">Material</p><p className="text-xs text-slate-600">{rfq.material}</p></div>
        )}
        {rfq.description && (
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">Description</p><p className="text-xs text-slate-600">{rfq.description}</p></div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-100">
          {rfq.status === 'draft' && (
            <>
              <button onClick={handleSend} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                <Send className="h-4 w-4" /> Send
              </button>
              <Link href={`/rfq/${rfq.id}/edit`} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold">
                <Edit className="h-4 w-4" /> Edit
              </Link>
            </>
          )}
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold">
            <Download className="h-4 w-4" /> Export PDF
          </button>
          {rfq.status === 'draft' && (
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}