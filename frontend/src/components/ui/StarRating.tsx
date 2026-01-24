import React, { useMemo } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export interface StarRatingProps {
  value: number;
  count?: number;
  interactive?: boolean;
  onChange?: (next: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, count, interactive, onChange, size = 18 }) => {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(clamped);
  const half = clamped % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  const stars = useMemo(() => {
    const result: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= full;
      const isHalf = i === full + 1 && half === 1;
      const key = `s-${i}`;
      const handleClick = () => interactive && onChange && onChange(i);
      const style: React.CSSProperties = { cursor: interactive ? 'pointer' : 'default', fontSize: size };
      if (filled) result.push(<FaStar key={key} color="#f1c40f" style={style} onClick={handleClick} />);
      else if (isHalf) result.push(<FaStarHalfAlt key={key} color="#f1c40f" style={style} onClick={handleClick} />);
      else result.push(<FaRegStar key={key} color="#f1c40f" style={style} onClick={handleClick} />);
    }
    return result;
  }, [full, half, interactive, onChange, size]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {stars}
      {typeof count === 'number' && (
        <span style={{ marginLeft: 6, color: '#666', fontSize: Math.max(12, size - 4) }}>({count})</span>
      )}
    </div>
  );
};

export default StarRating;


