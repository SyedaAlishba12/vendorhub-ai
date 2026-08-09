'use client';

import React, { useState, useEffect } from 'react';
import { ReviewCard } from '../../components/Reviews/ReviewCard';
import { ReviewModal } from '../../components/Reviews/ReviewModal';
import { RatingStars } from '../../components/Reviews/RatingStars';
import { Search, Plus, Star, BarChart3, Filter } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/api\/?$/, '');

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load reviews:', e);
      setReviews([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/statistics`);
      if (!res.ok) throw new Error('Failed to fetch statistics');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to load statistics:', e);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [search]);

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      const targetId = formData.id || selectedReview?.id || selectedReview?.review_id;
      const isEdit = Boolean(targetId);

      const url = isEdit
        ? `${API_BASE}/api/reviews/${targetId}`
        : `${API_BASE}/api/reviews`;
        
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchReviews();
        await fetchStats();
        setIsModalOpen(false);
        setSelectedReview(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Server Error (${res.status}): ${errData.detail || 'Could not save review'}`);
      }
    } catch (e: any) {
      console.error('Error saving review:', e);
      alert(`Network Error: ${e.message || 'Make sure FastAPI backend is running'}`);
    }
  };

  const handleHelpful = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/reviews/${id}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error('Helpful update error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, { 
        method: 'DELETE' 
      });
      if (res.ok) {
        fetchReviews();
        fetchStats();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Could not delete review: ${errData.detail || 'Server error'}`);
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Network error while deleting review.');
    }
  };

  const handleReport = async (id: string) => {
    const reason = prompt('State the reason for reporting this review:');
    if (reason && reason.trim()) {
      try {
        const res = await fetch(`${API_BASE}/api/reviews/${id}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim(), reported_by: 'BUY-001' }),
        });
        if (res.ok) {
          alert('Review reported to Admin moderation queue.');
          await fetchReviews();
        }
      } catch (e) {
        console.error('Report submission error:', e);
      }
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'ALL') return true;
    return Math.round(r.ratings?.overall_rating || 0) === Number(filterRating);
  });

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reviews & Ratings</h1>
          <p className="text-slate-500 text-xs mt-1">Multi-criteria feedback and vendor performance analytics</p>
        </div>
        <button
          onClick={() => { setSelectedReview(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold text-white transition shadow-md shadow-indigo-200"
        >
          <Plus size={16} /> Write Review
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-300 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-500 border border-amber-200"><Star size={24} /></div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Average Overall</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{stats.average_overall || '0.0'}</span>
                <RatingStars value={stats.average_overall || 0} size={14} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-300 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-200"><BarChart3 size={24} /></div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Reviews</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total_reviews || 0}</h3>
            </div>
          </div>

          <div className="col-span-2 bg-white border border-slate-300 p-5 rounded-2xl flex items-center justify-between text-xs text-slate-700 shadow-sm">
            <div className="space-y-2">
              <div>Product: <span className="font-bold text-amber-600">{stats.breakdown?.product || 0}</span></div>
              <div>Communication: <span className="font-bold text-amber-600">{stats.breakdown?.communication || 0}</span></div>
            </div>
            <div className="space-y-2">
              <div>Delivery: <span className="font-bold text-amber-600">{stats.breakdown?.delivery || 0}</span></div>
              <div>Quality: <span className="font-bold text-amber-600">{stats.breakdown?.quality || 0}</span></div>
            </div>
            <div>Service: <span className="font-bold text-amber-600">{stats.breakdown?.service || 0}</span></div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-300 p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search reviews or buyers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <ReviewCard
              key={rev.id || rev.review_id}
              review={rev}
              onEdit={(r) => { setSelectedReview(r); setIsModalOpen(true); }}
              onDelete={handleDelete}
              onReport={handleReport}
              onHelpful={handleHelpful}
            />
          ))
        ) : (
          <div className="col-span-2 text-center text-slate-400 py-16 bg-white border border-slate-200 rounded-2xl text-xs">
            No reviews found matching criteria.
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedReview}
      />
    </div>
  );
}