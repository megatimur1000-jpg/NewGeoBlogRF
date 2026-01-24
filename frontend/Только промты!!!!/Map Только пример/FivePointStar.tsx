import React from 'react';
import styled from 'styled-components';

// Компонент 5-угольной звезды
const FivePointStarStyled = styled.div<{ $color?: string; $size?: number }>`
  width: ${props => props.$size || 20}px;
  height: ${props => props.$size || 20}px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.$color || 'white'};
    clip-path: polygon(
      50% 0%,
      61% 35%,
      98% 35%,
      68% 57%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 57%,
      2% 35%,
      39% 35%
    );
  }
`;

interface FivePointStarProps {
  color?: string;
  size?: number;
  className?: string;
}

const FivePointStar: React.FC<FivePointStarProps> = ({ color, size, className }) => {
  return (
    <FivePointStarStyled 
      $color={color} 
      $size={size} 
      className={className}
    />
  );
};

export default FivePointStar;