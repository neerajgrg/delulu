import React from 'react';
import { StarIcon } from './Icons';

interface QualityStarsProps {
  quality: number;
  size?: 'sm' | 'md' | 'lg';
}

const QualityStars: React.FC<QualityStarsProps> = ({ quality, size = 'md' }) => {
  const pixelSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Quality: ${quality} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          filled={star <= quality}
          size={pixelSize}
        />
      ))}
    </div>
  );
};

export default QualityStars;
