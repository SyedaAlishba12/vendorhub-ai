import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number;
  onChange?: (val: number) => void;
  size?: number;
  readOnly?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ value, onChange, size = 18, readOnly = true }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(star)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            size={size}
            className={star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
          />
        </button>
      ))}
    </div>
  );
};