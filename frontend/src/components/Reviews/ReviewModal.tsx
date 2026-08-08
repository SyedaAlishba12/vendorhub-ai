'use client';

import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  initialData?: any;
}

export function ReviewModal({ isOpen, onClose, onSubmit, initialData }: ReviewModalProps) {
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState({
    product_rating: 5,
    communication_rating: 5,
    delivery_rating: 5,
    quality_rating: 5,
    service_rating: 5,
  });

  useEffect(() => {
    if (initialData) {
      setComment(initialData.comment || '');
      const r = initialData.ratings || initialData;
      setRatings({
        product_rating: Number(r.product_rating ?? r.product ?? 5),
        communication_rating: Number(r.communication_rating ?? r.communication ?? 5),
        delivery_rating: Number(r.delivery_rating ?? r.delivery ?? 5),
        quality_rating: Number(r.quality_rating ?? r.quality ?? 5),
        service_rating: Number(r.service_rating ?? r.service ?? 5),
      });
    } else {
      setComment('');
      setRatings({
        product_rating: 5,
        communication_rating: 5,
        delivery_rating: 5,
        quality_rating: 5,
        service_rating: 5,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleStarClick = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicitly pass review ID in form payload to guarantee backend lookup
    const payload = {
      id: initialData?.id || initialData?.review_id,
      vendor_id: initialData?.vendor_id || 'VEN-001',
      buyer_id: initialData?.buyer_id || 'BUY-001',
      buyer_name: initialData?.buyer_name || 'Zainab Bibi',
      product_id: initialData?.product_id || 'PROD-101',
      comment: comment.trim(),
      product_rating: Number(ratings.product_rating),
      communication_rating: Number(ratings.communication_rating),
      delivery_rating: Number(ratings.delivery_rating),
      quality_rating: Number(ratings.quality_rating),
      service_rating: Number(ratings.service_rating),
    };

    onSubmit(payload);
  };

  const renderStarRating = (label: string, key: keyof typeof ratings) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-700 capitalize">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => handleStarClick(key, star)}
            className="p-0.5 focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={18}
              className={`${
                star <= ratings[key]
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Review' : 'Write Review'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Feedback
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
              placeholder="Share details of your experience..."
            />
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Rating Breakdown
            </span>
            {renderStarRating('Product Quality', 'product_rating')}
            {renderStarRating('Communication', 'communication_rating')}
            {renderStarRating('Delivery Speed', 'delivery_rating')}
            {renderStarRating('Item Quality', 'quality_rating')}
            {renderStarRating('Customer Service', 'service_rating')}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition"
            >
              {initialData ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}