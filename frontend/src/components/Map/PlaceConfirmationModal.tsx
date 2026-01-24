import React from 'react';
import styled from 'styled-components';
import { DiscoveredPlace } from '../../services/placeDiscoveryService';
import { FaMapMarkerAlt, FaCheck, FaTimes, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';

interface PlaceConfirmationModalProps {
  discoveredPlace: DiscoveredPlace;
  onConfirm: (place: DiscoveredPlace) => void;
  onReject: () => void;
  onCustomName: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
`;

const PlaceInfo = styled.div`
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
`;

const PlaceName = styled.h3`
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlaceDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  color: #718096;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  color: #2d3748;
  font-size: 0.9rem;
`;

const SourceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 0.8rem;
  padding: 8px 12px;
  background: #edf2f7;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
`;

const ConfidenceFill = styled.div<{ confidence: number }>`
  height: 100%;
  background: ${({ confidence }) => 
    confidence >= 0.8 ? '#48bb78' : 
    confidence >= 0.6 ? '#ed8936' : 
    '#e53e3e'
  };
  width: ${({ confidence }) => confidence * 100}%;
  transition: width 0.3s ease;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' | 'outline' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #4299e1;
          color: white;
          &:hover {
            background: #3182ce;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: #48bb78;
          color: white;
          &:hover {
            background: #38a169;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #718096;
          border: 2px solid #e2e8f0;
          &:hover {
            background: #f7fafc;
            border-color: #cbd5e0;
          }
        `;
    }
  }}
`;

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'yandex':
      return '🔍';
    case 'osm':
      return '🗺️';
    case 'foursquare':
      return '📍';
    case 'google':
      return '🌐';
    default:
      return '📋';
  }
};

const getSourceName = (source: string) => {
  switch (source) {
    case 'yandex':
      return 'Яндекс.Справочник';
    case 'osm':
      return 'OpenStreetMap';
    case 'foursquare':
      return 'Foursquare';
    case 'google':
      return 'Google Places';
    default:
      return 'Локальная база';
  }
};

const getConfidenceText = (confidence: number) => {
  if (confidence >= 0.8) return 'Высокая уверенность';
  if (confidence >= 0.6) return 'Средняя уверенность';
  return 'Низкая уверенность';
};

export const PlaceConfirmationModal: React.FC<PlaceConfirmationModalProps> = ({
  discoveredPlace,
  onConfirm,
  onReject,
  onCustomName
}) => {
  const handleConfirm = () => {
    onConfirm(discoveredPlace);
  };

  const handleCustomName = () => {
    onCustomName();
  };

  const handleReject = () => {
    onReject();
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <Header>
          <Title>🎯 Обнаружено место</Title>
          <Subtitle>Система нашла информацию об этом месте</Subtitle>
        </Header>

        <PlaceInfo>
          <PlaceName>
            <FaMapMarkerAlt color="#4299e1" />
            {discoveredPlace.name}
          </PlaceName>

          <PlaceDetails>
            <DetailItem>
              <DetailLabel>Адрес</DetailLabel>
              <DetailValue>{discoveredPlace.address}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Тип</DetailLabel>
              <DetailValue>{discoveredPlace.type}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Категория</DetailLabel>
              <DetailValue>{discoveredPlace.category}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Уверенность</DetailLabel>
              <DetailValue>{getConfidenceText(discoveredPlace.confidence)}</DetailValue>
            </DetailItem>
          </PlaceDetails>

          <ConfidenceBar>
            <ConfidenceFill confidence={discoveredPlace.confidence} />
          </ConfidenceBar>

          <SourceInfo>
            <FaInfoCircle />
            <span>Источник: {getSourceIcon(discoveredPlace.source)} {getSourceName(discoveredPlace.source)}</span>
          </SourceInfo>
        </PlaceInfo>

        <Actions>
          <Button variant="secondary" onClick={handleConfirm}>
            <FaCheck />
            Использовать название
          </Button>
          
          <Button variant="outline" onClick={handleCustomName}>
            <FaExternalLinkAlt />
            Редактировать
          </Button>
          
          <Button variant="outline" onClick={handleReject}>
            <FaTimes />
            Отмена
          </Button>
        </Actions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PlaceConfirmationModal;
