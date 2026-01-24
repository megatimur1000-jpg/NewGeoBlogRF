import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Assuming Font Awesome is available

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
  z-index: 1000; /* Should be above everything else */
  backdrop-filter: blur(5px); /* Optional: blur background */
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  max-width: 90vw; /* Not more than 90% of viewport width */
  max-height: 90vh; /* Not more than 90% of viewport height */
  overflow: hidden; /* Hide scrollbars if content overflows, usually managed by inner div */
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5em;
  color: #333;
  cursor: pointer;
  z-index: 10;
  &:hover {
    color: #e74c3c;
  }
`;

const MainImageContainer = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  max-height: 70vh; /* Limit main image height */
  overflow: hidden;
`;

const MainImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Keep aspect ratio, fit within container */
  border-radius: 4px;
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 5px 0;
  overflow-x: auto; /* Enable horizontal scrolling for many thumbnails */
  flex-shrink: 0; /* Don't shrink when main image grows */
  max-width: 100%;
`;

const Thumbnail = styled.img<{ $isActive: boolean }>`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid ${props => (props.$isActive ? '#3498db' : 'transparent')};
  opacity: ${props => (props.$isActive ? 1 : 0.7)};
  transition: all 0.2s ease;
  &:hover {
    opacity: 1;
    border-color: #3498db;
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 10px;
  cursor: pointer;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11; /* Above modal content */
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const PrevButton = styled(NavigationButton)`
  left: 20px;
`;

const NextButton = styled(NavigationButton)`
  right: 20px;
`;

interface ImageGalleryModalProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [goToPrev, goToNext, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}> {/* Prevent closing when clicking inside content */}
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        
        {images.length > 1 && (
          <PrevButton onClick={goToPrev}>
            <FaChevronLeft />
          </PrevButton>
        )}
        
        <MainImageContainer>
          <MainImage src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} />
        </MainImageContainer>

        {images.length > 1 && (
          <NextButton onClick={goToNext}>
            <FaChevronRight />
          </NextButton>
        )}

        {images.length > 1 && (
          <ThumbnailsContainer>
            {images.map((imgSrc, index) => (
              <Thumbnail
                key={index}
                src={imgSrc}
                $isActive={index === currentIndex}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </ThumbnailsContainer>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ImageGalleryModal; 