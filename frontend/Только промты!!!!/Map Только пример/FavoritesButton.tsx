import React from 'react';
import styled from 'styled-components';
import { FaStar } from 'react-icons/fa';
import FivePointStar from './FivePointStar';

interface StyledButtonProps {
  $size?: number;
  $bgColor?: string;
  $borderColor?: string;
  $iconColor?: string;
}

const FavoritesButton = styled.button<StyledButtonProps>`
  /* Используем стили page-side-button с CSS переменными */
  position: relative;
  width: var(--right-button-size, 47px);
  height: var(--right-button-size, 47px);
  border-radius: 50%;
  background: var(--right-button-bg, ${props => props.$bgColor || '#008000'});
  border: var(--right-button-border-width, 2px) solid var(--right-button-border-color, ${props => props.$borderColor || '#8E9093'});
  color: ${props => props.$iconColor || 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 0;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const CountBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #fbbf24;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface FavoritesButtonProps {
  onClick: () => void;
  count: number;
  sizePx?: number;
  bgColor?: string;
  borderColor?: string;
  iconColor?: string;
}

const FavoritesButtonComponent: React.FC<FavoritesButtonProps> = ({ onClick, count, sizePx, bgColor, borderColor, iconColor }) => {
  return (
    <FavoritesButton onClick={onClick} title="Избранное" $size={sizePx} $bgColor={bgColor} $borderColor={borderColor} $iconColor={iconColor}>
      <FivePointStar color={iconColor || 'white'} size={20} />
      {count > 0 && <CountBadge>{count}</CountBadge>}
    </FavoritesButton>
  );
};

export default FavoritesButtonComponent;
