

import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaInfoCircle } from 'react-icons/fa';

const AddButton = styled.button<{ $isAddingMode: boolean }>`
  /* Используем стили page-side-button с CSS переменными */
  position: relative;
  width: var(--right-button-size, 47px);
  height: var(--right-button-size, 47px);
  border-radius: 50%;
  background-color: ${props => props.$isAddingMode ? '#e67e22' : '#3498db'};
  color: white;
  border: var(--right-button-border-width, 2px) solid var(--right-button-border-color, #8E9093);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    background-color: ${props => props.$isAddingMode ? '#d35400' : '#2980b9'};
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const InfoTooltip = styled.div`
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1001;
  
  &::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-left-color: rgba(0, 0, 0, 0.8);
  }
`;

const ButtonContainer = styled.div`
  position: relative;
  
  &:hover ${InfoTooltip} {
    opacity: 1;
  }
`;

interface AddMarkerButtonProps {
  setIsAddingMarkerMode: React.Dispatch<React.SetStateAction<boolean>>;
  setMapMessage: React.Dispatch<React.SetStateAction<string | null>>;
  isAddingMarkerMode: boolean;
}

const AddMarkerButton: React.FC<AddMarkerButtonProps> = ({
  setIsAddingMarkerMode,
  setMapMessage,
  isAddingMarkerMode
}) => {
  // Клик по "+" - показываем философию культуры меток
  const handleAddButtonClick = () => {
    setIsAddingMarkerMode(true);
    setMapMessage('🎯 Культура меток: Добавляйте места с уважением к реальности. Система поможет найти официальные названия.');
  };

  return (
    <ButtonContainer>
      <AddButton onClick={handleAddButtonClick} $isAddingMode={isAddingMarkerMode}>
        <FaPlus />
      </AddButton>
      <InfoTooltip>
        <FaInfoCircle style={{ marginRight: 4 }} />
        Добавить метку с уважением
      </InfoTooltip>
    </ButtonContainer>
  );
};

export default AddMarkerButton;
