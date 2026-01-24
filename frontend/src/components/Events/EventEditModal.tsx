import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Save, Send } from 'lucide-react';
import { ExternalEvent } from '../../services/externalEventsService';
import './EventEditModal.css';

interface EventEditModalProps {
  event: ExternalEvent;
  onClose: () => void;
  onSave: (updatedEvent: ExternalEvent & { photo_urls?: string[]; cover_image_url?: string }) => void;
  onSendForModeration?: (updatedEvent: ExternalEvent & { photo_urls?: string[]; cover_image_url?: string }) => void;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({ event, onSave, onClose, onSendForModeration }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [additionalPhotoUrls, setAdditionalPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Инициализация существующих фото
  React.useEffect(() => {
    const eventAny = event as any;
    if (eventAny.cover_image_url) {
      setCoverImageUrl(eventAny.cover_image_url);
    } else if (event.image_url) {
      setCoverImageUrl(event.image_url);
    }

    if (eventAny.photo_urls) {
      let photos: string[] = [];
      if (Array.isArray(eventAny.photo_urls)) {
        photos = eventAny.photo_urls.filter(Boolean);
      } else if (typeof eventAny.photo_urls === 'string') {
        photos = eventAny.photo_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      // Исключаем главное фото из дополнительных
      const mainPhoto = coverImageUrl || event.image_url;
      setAdditionalPhotoUrls(photos.filter(url => url !== mainPhoto));
    }
  }, [event, coverImageUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          alert('Пожалуйста, выберите изображение');
          return null;
        }

        const formData = new FormData();
        formData.append('image', file);
        
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Необходимо авторизоваться для загрузки фотографий');
          return null;
        }

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // НЕ добавляем Content-Type - браузер установит его автоматически с boundary для FormData
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          return data.photoUrl;
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Ошибка загрузки' }));
          console.error('Ошибка загрузки фото:', errorData);
          throw new Error(errorData.message || 'Ошибка загрузки фотографии');
        }
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null && url !== undefined);

      if (isCover && validUrls.length > 0) {
        setCoverImageUrl(validUrls[0]);
      } else {
        setAdditionalPhotoUrls(prev => [...prev, ...validUrls]);
      }
    } catch (error) {
      console.error('Ошибка загрузки фотографий:', error);
      alert(`Ошибка загрузки фотографий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removePhoto = (url: string, isCover: boolean = false) => {
    if (isCover) {
      setCoverImageUrl(null);
    } else {
      setAdditionalPhotoUrls(prev => prev.filter(u => u !== url));
    }
  };

  const handleSave = async () => {
    // Формируем массив всех фото: главное фото + дополнительные (исключая дубликаты)
    const allPhotos: string[] = [];
    
    // Добавляем главное фото первым, если оно есть
    if (coverImageUrl) {
      allPhotos.push(coverImageUrl);
    }
    
    // Добавляем дополнительные фото, исключая главное
    additionalPhotoUrls.forEach(url => {
      if (url !== coverImageUrl && !allPhotos.includes(url)) {
        allPhotos.push(url);
      }
    });

    // Сохраняем изменения
    onSave({
      ...event,
      cover_image_url: coverImageUrl || undefined,
      image_url: coverImageUrl || event.image_url || undefined,
      photo_urls: allPhotos.length > 0 ? allPhotos : undefined
    });
  };

  return (
    <div className="event-edit-overlay" onClick={onClose}>
      <div className="event-edit-container" onClick={(e) => e.stopPropagation()}>
        <div className="event-edit-header">
          <h2 className="event-edit-title">Редактирование события</h2>
          <button onClick={onClose} className="event-edit-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="event-edit-content">
          {/* Главное фото */}
          <div className="event-edit-section">
            <h3 className="event-edit-section-title">Главное фото</h3>
            <div className="event-edit-photo-area">
              {coverImageUrl ? (
                <div className="event-edit-photo-preview">
                  <img src={coverImageUrl} alt="Главное фото" />
                  <button
                    onClick={() => removePhoto(coverImageUrl, true)}
                    className="event-edit-photo-remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="event-edit-photo-upload"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8" />
                  <span>Загрузить главное фото</span>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e, true)}
              />
            </div>
          </div>

          {/* Дополнительные фотографии */}
          <div className="event-edit-section">
            <h3 className="event-edit-section-title">Дополнительные фотографии</h3>
            <div className="event-edit-photos-grid">
              {additionalPhotoUrls.map((url, index) => (
                <div key={index} className="event-edit-photo-preview">
                  <img src={url} alt={`Фото ${index + 1}`} />
                  <button
                    onClick={() => removePhoto(url)}
                    className="event-edit-photo-remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div
                className="event-edit-photo-upload-small"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-6 h-6" />
                <span>Добавить</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, false)}
            />
          </div>
        </div>

        <div className="event-edit-footer">
          <button onClick={onClose} className="event-edit-btn-cancel" disabled={uploading}>
            Отмена
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="event-edit-btn-save"
            >
              {uploading ? (
                <>
                  <div className="event-edit-spinner" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Сохранить
                </>
              )}
            </button>
            {onSendForModeration && (
              <button
                onClick={() => {
                  const allPhotos: string[] = [];
                  if (coverImageUrl) {
                    allPhotos.push(coverImageUrl);
                  }
                  additionalPhotoUrls.forEach(url => {
                    if (url !== coverImageUrl && !allPhotos.includes(url)) {
                      allPhotos.push(url);
                    }
                  });
                  onSendForModeration({
                    ...event,
                    cover_image_url: coverImageUrl || undefined,
                    image_url: coverImageUrl || event.image_url || undefined,
                    photo_urls: allPhotos.length > 0 ? allPhotos : undefined
                  });
                }}
                disabled={uploading}
                className="event-edit-btn-moderation"
              >
                <Send className="w-4 h-4" />
                На модерацию
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

