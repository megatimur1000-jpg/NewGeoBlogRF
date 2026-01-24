import React from 'react';
// import { Heart, Share2, MapPin, Clock, Camera } from 'lucide-react';

interface EventPreviewProps {
  event: any;
  isPreview?: boolean;
}

export const EventPreview: React.FC<EventPreviewProps> = ({ event }) => {
  if (!event) return null;

  return (
    <div className="event-preview">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      {event.photos && event.photos.length > 0 && (
        <div className="photos">
          {event.photos.map((photo: any, index: number) => (
            <img key={index} src={photo} alt={`Photo ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
};