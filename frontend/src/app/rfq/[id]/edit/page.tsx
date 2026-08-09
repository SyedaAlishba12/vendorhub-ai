'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import apiClient from '../../../../utils/api/apiClient';
import RFQForm from '../../../../components/rfq/RFQForm';

export default function EditRFQPage() {
const { id } = useParams() as { id: string };
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get(`/rfq/${id}`)
      .then(res => {
        setInitialData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to load RFQ');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!initialData) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <Link href={`/rfq/${id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-xs font-bold">
        <ArrowLeft className="h-4 w-4" /> Back to RFQ
      </Link>
      <h1 className="text-2xl font-black text-slate-900">Edit RFQ</h1>
      <RFQForm initialData={initialData} />
    </div>
  );
}