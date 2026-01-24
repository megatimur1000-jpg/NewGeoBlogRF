import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image, File, X, Paperclip, Camera } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // в МБ
  allowedTypes?: string[];
  roomId: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  maxFileSize = 10, // 10 МБ
  allowedTypes = ['image/*', 'application/pdf', 'text/*'],
  roomId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Проверка типа файла
  const isFileTypeAllowed = (file: File): boolean => {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  };

  // Проверка размера файла
  const isFileSizeAllowed = (file: File): boolean => {
    return file.size <= maxFileSize * 1024 * 1024;
  };

  // Обработка выбора файлов
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      if (!isFileTypeAllowed(file)) {
        errors.push(`Файл "${file.name}" имеет недопустимый тип`);
        return;
      }

      if (!isFileSizeAllowed(file)) {
        errors.push(`Файл "${file.name}" слишком большой (макс. ${maxFileSize} МБ)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Ошибки загрузки:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      // Создаем превью для изображений
      const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
        id: Date.now() + Math.random().toString(),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: 'uploading'
      }));

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      
      // Симулируем загрузку
      newUploadedFiles.forEach(uploadedFile => {
        simulateFileUpload(uploadedFile.id);
      });

      onFileSelect(validFiles);
    }
  }, [maxFileSize, onFileSelect]);

  // Симуляция загрузки файла
  const simulateFileUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => {
        const file = prev.find(f => f.id === fileId);
        if (!file) return prev;

        if (file.progress >= 100) {
          clearInterval(interval);
          return prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'success' as const }
              : f
          );
        }

        return prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: f.progress + 10 }
            : f
        );
      });
    }, 100);
  };

  // Логирование roomId для отладки
  useEffect(() => {
    if (roomId) {
      }
  }, [roomId]);

  // Обработка перетаскивания
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Удаление файла
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Открытие камеры
  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  // Получение иконки для типа файла
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={20} />;
    if (file.type.startsWith('video/')) return <File size={20} />;
    if (file.type.startsWith('audio/')) return <File size={20} />;
    return <File size={20} />;
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload">
      {/* Кнопка загрузки */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-modern"
        title="Прикрепить файл"
      >
        <Paperclip size={16} />
        Файл
      </button>

      {/* Панель загрузки */}
      {isOpen && (
        <div className="upload-panel">
          <div className="upload-header">
            <h3>Загрузка файлов</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-modern"
            >
              <X size={16} />
            </button>
          </div>

          {/* Область перетаскивания */}
          <div
            className={`upload-drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={48} className="upload-icon" />
            <p>Перетащите файлы сюда или</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-modern"
            >
              Выбрать файлы
            </button>
            <p className="upload-info">
              Максимум {maxFiles} файлов, размер до {maxFileSize} МБ
            </p>
          </div>

          {/* Кнопки быстрого доступа */}
          <div className="upload-actions">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-modern"
            >
              <File size={16} />
              Выбрать файлы
            </button>
            
            <button
              onClick={openCamera}
              className="btn-modern"
            >
              <Camera size={16} />
              Камера
            </button>
          </div>

          {/* Список загруженных файлов */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h4>Загруженные файлы:</h4>
              {uploadedFiles.map(uploadedFile => (
                <div
                  key={uploadedFile.id}
                  className={`uploaded-file ${uploadedFile.status}`}
                >
                  <div className="file-info">
                    <div className="file-icon">
                      {getFileIcon(uploadedFile.file)}
                    </div>
                    <div className="file-details">
                      <div className="file-name">{uploadedFile.file.name}</div>
                      <div className="file-size">
                        {formatFileSize(uploadedFile.file.size)}
                      </div>
                    </div>
                  </div>

                  <div className="file-preview">
                    {uploadedFile.preview && (
                      <img
                        src={uploadedFile.preview}
                        alt="Preview"
                        className="file-preview-image"
                      />
                    )}
                  </div>

                  <div className="file-progress">
                    {uploadedFile.status === 'uploading' && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                    )}
                    {uploadedFile.status === 'success' && (
                      <span className="status-success">✓ Загружено</span>
                    )}
                    {uploadedFile.status === 'error' && (
                      <span className="status-error">✗ Ошибка</span>
                    )}
                  </div>

                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="remove-file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Скрытые input'ы */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
