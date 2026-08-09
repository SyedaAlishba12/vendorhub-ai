'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, Flag, Edit, Trash2 } from 'lucide-react';
import { RatingStars } from './RatingStars';

interface ReviewCardProps {
  review: any;
  onEdit: (review: any) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
  onHelpful?: (id: string) => void;
}

export function ReviewCard({ review, onEdit, onDelete, onReport }: ReviewCardProps) {
  const isReported = Boolean(review.is_reported);
  const reviewId = review.id || review.review_id;
  const storageKey = `helpful_${reviewId}`;

  const [isHelpfulActive, setIsHelpfulActive] = useState<boolean>(false);

  // Read saved state on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && reviewId) {
      const savedState = localStorage.getItem(storageKey);
      if (savedState === 'true') {
        setIsHelpfulActive(true);
      }
    }
  }, [reviewId, storageKey]);

  // Pure UI toggle (1 if active, 0 if inactive)
  const displayCount = isHelpfulActive ? 1 : 0;

  const handleHelpfulClick = () => {
    const nextState = !isHelpfulActive;
    setIsHelpfulActive(nextState);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(nextState));
    }
  };

  const ratings = review.ratings || {};

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md hover:border-slate-400 transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{review.buyer_name || 'Anonymous'}</h3>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {reviewId}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(review)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title="Edit Review"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(reviewId)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
            title="Delete Review"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => !isReported && onReport(reviewId)}
            disabled={isReported}
            className={`p-1.5 rounded-lg transition ${
              isReported
                ? 'text-red-500 cursor-not-allowed bg-red-50'
                : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
            }`}
            title={isReported ? 'Already Reported' : 'Report Review'}
          >
            <Flag size={14} className={isReported ? 'fill-red-500' : ''} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <RatingStars value={ratings.overall_rating || 5} size={14} />
        <span className="text-xs font-bold text-amber-500">
          {ratings.overall_rating || '5.0'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div>Prod: <span className="font-semibold text-amber-600">{ratings.product_rating ?? 5}★</span></div>
        <div>Comm: <span className="font-semibold text-amber-600">{ratings.communication_rating ?? 5}★</span></div>
        <div>Deliv: <span className="font-semibold text-amber-600">{ratings.delivery_rating ?? 5}★</span></div>
        <div>Qual: <span className="font-semibold text-amber-600">{ratings.quality_rating ?? 5}★</span></div>
        <div>Serv: <span className="font-semibold text-amber-600">{ratings.service_rating ?? 5}★</span></div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[11px]">
        <button
          onClick={handleHelpfulClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition border ${
            isHelpfulActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
          }`}
        >
          <ThumbsUp size={13} className={isHelpfulActive ? 'fill-emerald-600' : ''} />
          <span>Helpful ({displayCount})</span>
        </button>

        {isReported && (
          <span className="text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
            Reported
          </span>
        )}
      </div>
    </div>
  );
}