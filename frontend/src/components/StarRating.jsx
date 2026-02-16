import { useState, useCallback, memo } from 'react';
import { Star } from 'lucide-react';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const StarRating = memo(function StarRating({
  value = 0,
  onChange,
  size = 'md',
  readOnly = false,
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const starSize = sizeMap[size] || sizeMap.md;

  const handleClick = useCallback(
    (rating) => {
      if (!readOnly && onChange) onChange(rating);
    },
    [readOnly, onChange]
  );

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverValue || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125'} transition-transform duration-150`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${starSize} transition-colors duration-150 ${
                filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
});

export default StarRating;
