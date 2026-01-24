import React, { useState, useEffect, useMemo } from 'react';
import { FaCloud, FaCloudUploadAlt, FaTrash, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaImage, FaMapMarkerAlt, FaRoute, FaCalendar, FaEdit, FaFilter } from 'react-icons/fa';
import { offlineContentStorage, AnyOfflineDraft, ContentType, OfflinePostDraft, OfflineMarkerDraft, OfflineRouteDraft, OfflineEventDraft } from '../../services/offlineContentStorage';
import { offlineContentQueue } from '../../services/offlineContentQueue';

interface OfflineDraftsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineDraftsPanel: React.FC<OfflineDraftsPanelProps> = ({ isOpen, onClose }) => {
  const [drafts, setDrafts] = useState<AnyOfflineDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<ContentType | 'all'>('all');
  const [uploadProgress, setUploadProgress] = useState<{ contentId: string; contentType: ContentType; stage: string; progress: number; error?: string } | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
      
      // Подписываемся на прогресс загрузки
      const unsubscribe = offlineContentQueue.onProgress((progress) => {
        if (progress) {
          setUploadProgress({
            contentId: progress.contentId,
            contentType: progress.contentType,
            stage: progress.stage,
            progress: progress.progress,
            error: progress.error
          });
        } else {
          setUploadProgress(null);
        }
        // Обновляем список после изменения прогресса
        loadDrafts();
      });

      return () => {
        unsubscribe();
        // Очищаем превью при закрытии
        Object.values(imagePreviews).flat().forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [isOpen]);

  // Создаём превью для изображений
  useEffect(() => {
    const previews: Record<string, string[]> = {};
    
    drafts.forEach(draft => {
      if (draft.images && draft.images.length > 0) {
        previews[draft.id] = draft.images.map(file => URL.createObjectURL(file));
      }
    });
    
    setImagePreviews(prev => {
      // Очищаем старые превью
      Object.values(prev).flat().forEach(url => URL.revokeObjectURL(url));
      return previews;
    });
  }, [drafts]);

  // Фильтруем черновики по выбранному типу
  const filteredDrafts = useMemo(() => {
    if (selectedFilter === 'all') {
      return drafts;
    }
    return drafts.filter(draft => draft.contentType === selectedFilter);
  }, [drafts, selectedFilter]);

  // Статистика по типам
  const draftsStats = useMemo(() => {
    const stats = {
      all: drafts.length,
      post: drafts.filter(d => d.contentType === 'post').length,
      marker: drafts.filter(d => d.contentType === 'marker').length,
      route: drafts.filter(d => d.contentType === 'route').length,
      event: drafts.filter(d => d.contentType === 'event').length
    };
    return stats;
  }, [drafts]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const allDrafts = await offlineContentStorage.getAllDrafts();
      setDrafts(allDrafts);
    } catch (error) {
      console.error('Ошибка загрузки черновиков:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDraft = async (draftId: string) => {
    try {
      await offlineContentQueue.uploadDraftById(draftId);
      await loadDrafts();
    } catch (error: any) {
      console.error('Ошибка отправки черновика:', error);
      
      // Более информативное сообщение об ошибке
      let errorMessage = 'Не удалось отправить черновик';
      
      if (error.response?.status === 401) {
        errorMessage = 'Требуется авторизация. Пожалуйста, войдите в систему.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Неверные данные черновика';
      } else if (error.response?.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Удалить этот черновик?')) {
      return;
    }

    try {
      await offlineContentStorage.deleteDraft(draftId);
      await loadDrafts();
    } catch (error) {
      console.error('Ошибка удаления черновика:', error);
      alert('Не удалось удалить черновик');
    }
  };

  const getStatusIcon = (draft: AnyOfflineDraft) => {
    if (draft.status === 'uploading') {
      return <FaSpinner className="animate-spin text-blue-600" />;
    } else if (draft.status === 'failed' || draft.status === 'failed_permanent') {
      return <FaExclamationTriangle className="text-red-600" />;
    } else {
      return <FaCloud className="text-gray-600" />;
    }
  };

  const getStatusText = (draft: AnyOfflineDraft) => {
    if (draft.status === 'uploading') {
      return 'Отправляется...';
    } else if (draft.status === 'failed') {
      return `Ошибка (попытка ${draft.retries}/5)`;
    } else if (draft.status === 'failed_permanent') {
      return 'Не удалось отправить';
    } else {
      return 'Черновик';
    }
  };

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'post':
        return <FaEdit className="text-blue-600" />;
      case 'marker':
        return <FaMapMarkerAlt className="text-green-600" />;
      case 'route':
        return <FaRoute className="text-orange-600" />;
      case 'event':
        return <FaCalendar className="text-purple-600" />;
      default:
        return <FaCloud className="text-gray-600" />;
    }
  };

  const getContentTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case 'post':
        return 'Пост';
      case 'marker':
        return 'Метка';
      case 'route':
        return 'Маршрут';
      case 'event':
        return 'Событие';
      default:
        return 'Контент';
    }
  };

  const renderDraftPreview = (draft: AnyOfflineDraft) => {
    switch (draft.contentType) {
      case 'post':
        const postDraft = draft as OfflinePostDraft;
        return (
          <>
            <p className="text-sm text-gray-800 mb-2 line-clamp-2">
              {postDraft.contentData.text || 'Без текста'}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              {postDraft.hasImages && postDraft.images && postDraft.images.length > 0 && (
                <span className="flex items-center gap-1">
                  <FaImage size={12} />
                  {postDraft.images.length} фото
                </span>
              )}
              {postDraft.hasTrack && postDraft.track && (
                <span>🗺️ Трек</span>
              )}
            </div>
          </>
        );
      
      case 'marker':
        const markerDraft = draft as OfflineMarkerDraft;
        return (
          <>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {markerDraft.contentData.title || 'Новая метка'}
            </p>
            {markerDraft.contentData.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {markerDraft.contentData.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              {markerDraft.contentData.category && (
                <span>📂 {markerDraft.contentData.category}</span>
              )}
              {markerDraft.hasImages && markerDraft.images && markerDraft.images.length > 0 && (
                <span className="flex items-center gap-1">
                  <FaImage size={12} />
                  {markerDraft.images.length} фото
                </span>
              )}
              {markerDraft.contentData.latitude && markerDraft.contentData.longitude && (
                <span>📍 {markerDraft.contentData.latitude.toFixed(4)}, {markerDraft.contentData.longitude.toFixed(4)}</span>
              )}
            </div>
          </>
        );
      
      case 'route':
        const routeDraft = draft as OfflineRouteDraft;
        return (
          <>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {routeDraft.contentData.title || 'Новый маршрут'}
            </p>
            {routeDraft.contentData.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {routeDraft.contentData.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              {routeDraft.contentData.points && (
                <span>📍 {routeDraft.contentData.points.length} точек</span>
              )}
              {routeDraft.hasTrack && routeDraft.track && (
                <span>🗺️ Трек</span>
              )}
              {routeDraft.contentData.totalDistance && (
                <span>📏 {routeDraft.contentData.totalDistance.toFixed(1)} км</span>
              )}
            </div>
          </>
        );
      
      case 'event':
        const eventDraft = draft as OfflineEventDraft;
        return (
          <>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {eventDraft.contentData.title || 'Новое событие'}
            </p>
            {eventDraft.contentData.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {eventDraft.contentData.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              {eventDraft.contentData.start_datetime && (
                <span>📅 {new Date(eventDraft.contentData.start_datetime).toLocaleDateString('ru-RU')}</span>
              )}
              {eventDraft.contentData.location && (
                <span>📍 {eventDraft.contentData.location}</span>
              )}
              {eventDraft.hasImages && eventDraft.images && eventDraft.images.length > 0 && (
                <span className="flex items-center gap-1">
                  <FaImage size={12} />
                  {eventDraft.images.length} фото
                </span>
              )}
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FaCloud className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Офлайн черновики ({drafts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Фильтры по типу контента */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-500" size={14} />
            <span className="text-sm font-medium text-gray-700 mr-2">Тип:</span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Все ({draftsStats.all})
            </button>
            <button
              onClick={() => setSelectedFilter('post')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedFilter === 'post'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaEdit size={12} />
              Посты ({draftsStats.post})
            </button>
            <button
              onClick={() => setSelectedFilter('marker')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedFilter === 'marker'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaMapMarkerAlt size={12} />
              Метки ({draftsStats.marker})
            </button>
            <button
              onClick={() => setSelectedFilter('route')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedFilter === 'route'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaRoute size={12} />
              Маршруты ({draftsStats.route})
            </button>
            <button
              onClick={() => setSelectedFilter('event')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedFilter === 'event'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaCalendar size={12} />
              События ({draftsStats.event})
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-600" size={24} />
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <FaCloud className="text-gray-300 mx-auto mb-4" size={48} />
              <p className="text-gray-600">
                {selectedFilter === 'all' 
                  ? 'Нет сохранённых черновиков'
                  : `Нет черновиков типа "${getContentTypeLabel(selectedFilter as ContentType)}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrafts.map((draft) => {
                const isUploading = draft.status === 'uploading';
                const isFailed = draft.status === 'failed' || draft.status === 'failed_permanent';
                const currentProgress = uploadProgress?.contentId === draft.id ? uploadProgress : null;

                return (
                  <div
                    key={draft.id}
                    className={`border rounded-lg p-4 ${
                      isUploading ? 'border-blue-300 bg-blue-50' :
                      isFailed ? 'border-red-300 bg-red-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Левая часть: информация */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(draft)}
                          {getContentTypeIcon(draft.contentType)}
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {getContentTypeLabel(draft.contentType)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {getStatusText(draft)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(draft.createdAt)}
                          </span>
                        </div>

                        {/* Превью контента (зависит от типа) */}
                        {renderDraftPreview(draft)}

                        {/* Превью изображений */}
                        {imagePreviews[draft.id] && imagePreviews[draft.id].length > 0 && (
                          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                            {imagePreviews[draft.id].slice(0, 5).map((previewUrl, idx) => (
                              <div key={idx} className="flex-shrink-0 relative group">
                                <img
                                  src={previewUrl}
                                  alt={`Превью ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                />
                                {idx === 4 && draft.images && draft.images.length > 5 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                    +{draft.images.length - 5}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Прогресс загрузки */}
                        {currentProgress && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>
                                {currentProgress.stage === 'creating' && `Создание ${getContentTypeLabel(currentProgress.contentType)}...`}
                                {currentProgress.stage === 'uploading_images' && 'Загрузка фото...'}
                                {currentProgress.stage === 'uploading_track' && 'Загрузка трека...'}
                                {currentProgress.stage === 'completed' && 'Готово!'}
                              </span>
                              <span>{currentProgress.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${currentProgress.progress}%` }}
                              />
                            </div>
                            {currentProgress.error && (
                              <p className="text-xs text-red-600 mt-1">{currentProgress.error}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Правая часть: действия */}
                      <div className="flex items-center gap-2">
                        {!isUploading && (
                          <>
                            <button
                              onClick={() => handleUploadDraft(draft.id)}
                              disabled={!navigator.onLine}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                              title={!navigator.onLine ? 'Нет интернета' : 'Отправить сейчас'}
                            >
                              <FaCloudUploadAlt size={14} />
                              Отправить
                            </button>
                            <button
                              onClick={() => handleDeleteDraft(draft.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                        {isUploading && (
                          <div className="flex items-center gap-2 text-blue-600 text-sm">
                            <FaSpinner className="animate-spin" />
                            <span>Отправка...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {navigator.onLine ? (
              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Интернет подключён
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-600" />
                Нет интернета — черновики будут отправлены автоматически при подключении
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineDraftsPanel;

