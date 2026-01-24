import React from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { Place } from '../../services/geocodingService';
import { MarkerData } from '../../types/marker';

// Интерфейс для пропсов компонента
interface SearchResultsDropdownProps {
  places: Place[];
  markers: MarkerData[];
  loading: boolean;
  onPlaceSelect: (place: Place) => void;
  onMarkerSelect: (marker: MarkerData) => void;
}

// Стили
const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 1500;
  margin-top: 4px;
  max-height: 450px;
  overflow-y: auto;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SectionTitle = styled.h4`
  padding: 8px 16px;
  margin: 0;
  font-size: 0.75rem;
  font-weight: bold;
  color: #666;
  background-color: #f8f9fa;
  text-transform: uppercase;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
`;

const ResultItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e9f5ff;
  }

  .icon {
    margin-right: 12px;
    color: #007bff;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ItemName = styled.span`
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemLabel = styled.span`
  font-size: 0.8rem;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoResults = styled.div`
  padding: 24px;
  text-align: center;
  color: #888;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;

  &::after {
    content: '';
    width: 28px;
    height: 28px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  places,
  markers,
  loading,
  onPlaceSelect,
  onMarkerSelect,
}) => {
  const hasPlaces = places.length > 0;
  const hasMarkers = markers.length > 0;
  const noResults = !hasPlaces && !hasMarkers;

  if (loading) {
    return (
      <DropdownContainer>
        <LoadingSpinner />
      </DropdownContainer>
    );
  }
  
  if (noResults) {
      return (
        <DropdownContainer>
            <NoResults>Ничего не найдено</NoResults>
        </DropdownContainer>
      )
  }

  return (
    <DropdownContainer>
      {hasPlaces && (
        <>
          <SectionTitle>Перейти к месту</SectionTitle>
          {places.map(place => (
            <ResultItem key={place.id} onClick={() => onPlaceSelect(place)}>
              <FaLocationArrow className="icon" />
              <ItemDetails>
                <ItemName>{place.name}</ItemName>
                <ItemLabel>{place.label}</ItemLabel>
              </ItemDetails>
            </ResultItem>
          ))}
        </>
      )}

      {hasMarkers && (
        <>
          <SectionTitle>Найденные метки</SectionTitle>
          {markers.map(marker => (
            <ResultItem key={marker.id} onClick={() => onMarkerSelect(marker)}>
              <FaMapMarkerAlt className="icon" />
              <ItemDetails>
                <ItemName>{marker.title}</ItemName>
                {marker.address && <ItemLabel>{marker.address}</ItemLabel>}
              </ItemDetails>
            </ResultItem>
          ))}
        </>
      )}
    </DropdownContainer>
  );
};

export default SearchResultsDropdown; 