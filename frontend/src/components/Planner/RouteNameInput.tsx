import React, { useState, useEffect, useMemo } from 'react';
import { FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaMagic } from 'react-icons/fa';

interface InputRoutePoint {
  id: number | string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
}

interface RouteNameInputProps {
  points: InputRoutePoint[];
  currentTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

// Запрещенные слова и фразы
const FORBIDDEN_WORDS = [
  'говно', 'дерьмо', 'срань', 'говня', 'дерьма', 'говню', 'говном', 'говне',
  'хуй', 'хуя', 'хуем', 'хуи', 'хуев', 'хуям', 'хуями', 'хуях',
  'пизда', 'пизды', 'пизде', 'пизду', 'пиздой', 'пиздою',
  'блять', 'блядь', 'бляди', 'блядью', 'блядям', 'блядями', 'блядях',
  'ебать', 'ебат', 'ебал', 'ебала', 'ебали', 'ебать', 'ебет', 'ебут',
  'сука', 'суки', 'суке', 'суку', 'сукой', 'сукою', 'сукам', 'суками', 'суках',
  'мудак', 'мудаки', 'мудака', 'мудаку', 'мудаком', 'мудаке', 'мудакам', 'мудаками', 'мудаках',
  'идиот', 'дебил', 'тупой', 'дурак', 'придурок', 'козел', 'козел', 'козлы',
  'спам', 'реклама', 'купить', 'продать', 'скидка', 'акция', 'бесплатно',
  'вирус', 'взлом', 'хак', 'краш', 'баг', 'глюк', 'лаги', 'тормозит'
];

// Категории объектов для генерации подсказок
const OBJECT_CATEGORIES = {
  culture: ['музей', 'театр', 'галерея', 'выставка', 'концерт', 'опера', 'балет', 'скульптура', 'картина', 'архитектура'],
  history: ['кремль', 'собор', 'церковь', 'монастырь', 'крепость', 'замок', 'дворец', 'усадьба', 'памятник', 'мемориал'],
  nature: ['парк', 'сад', 'лес', 'озеро', 'река', 'гора', 'водопад', 'заповедник', 'ботанический', 'зоопарк'],
  food: ['ресторан', 'кафе', 'бар', 'пиццерия', 'суши', 'шашлык', 'шаурма', 'кофейня', 'кондитерская', 'рынок'],
  transport: ['вокзал', 'аэропорт', 'метро', 'автобус', 'трамвай', 'троллейбус', 'такси', 'стоянка', 'парковка'],
  entertainment: ['кинотеатр', 'боулинг', 'каток', 'бассейн', 'спортзал', 'игровая', 'развлекательный', 'аттракцион'],
  education: ['университет', 'школа', 'библиотека', 'лаборатория', 'исследовательский', 'научный', 'образовательный'],
  shopping: ['торговый', 'магазин', 'бутик', 'молл', 'центр', 'супермаркет', 'гипермаркет', 'рынок', 'базар'],
  health: ['больница', 'поликлиника', 'аптека', 'санаторий', 'спа', 'массаж', 'фитнес', 'йога', 'медицинский'],
  business: ['офис', 'бизнес', 'корпоративный', 'деловой', 'финансовый', 'банк', 'страховая', 'юридический']
};

// Географические подсказки (пока не используются, но могут пригодиться в будущем)
// const GEOGRAPHIC_HINTS = {
//   russia: ['сердце России', 'русская душа', 'родные просторы', 'земля русская', 'от Москвы до окраин'],
//   moscow: ['столица', 'сердце страны', 'белокаменная', 'златоглавая', 'Москва златоглавая'],
//   spb: ['северная столица', 'культурная столица', 'град Петров', 'город на Неве', 'окно в Европу'],
//   volga: ['волжские просторы', 'матушка Волга', 'волжский путь', 'речные дали'],
//   caucasus: ['кавказские горы', 'горные тропы', 'высокогорье', 'горный край'],
//   siberia: ['сибирские просторы', 'таежный край', 'сибирская глубинка', 'край земли'],
//   far_east: ['дальневосточный край', 'край земли', 'тихоокеанский берег', 'край восходящего солнца']
// };

const RouteNameInput: React.FC<RouteNameInputProps> = ({
  points,
  currentTitle,
  onTitleChange,
  onSave,
  onCancel,
  isVisible
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Генерация подсказок на основе точек маршрута
  const suggestions = useMemo(() => {
    if (points.length < 2) return [];

    const suggestions: string[] = [];
    
    // Анализируем типы объектов
    const objectTypes = new Set<string>();
    points.forEach(point => {
      const titleLower = (point.title || '').toLowerCase();
      const descLower = (point.description || '').toLowerCase();
      
      Object.entries(OBJECT_CATEGORIES).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (titleLower.includes(keyword) || descLower.includes(keyword)) {
            objectTypes.add(category);
          }
        });
      });
    });

    // Генерируем подсказки на основе типов объектов
    if (objectTypes.has('culture')) {
      suggestions.push('От кремля к шедеврам');
      suggestions.push('Путь через века искусства');
      suggestions.push('Культурное путешествие');
    }
    
    if (objectTypes.has('history')) {
      suggestions.push('Путь через сердце России');
      suggestions.push('От древности к современности');
      suggestions.push('Исторический маршрут');
    }
    
    if (objectTypes.has('nature')) {
      suggestions.push('Природные красоты');
      suggestions.push('Путь через зеленые просторы');
      suggestions.push('Наедине с природой');
    }
    
    if (objectTypes.has('food')) {
      suggestions.push('Вкус родного края');
      suggestions.push('Гастрономическое путешествие');
      suggestions.push('Кулинарные открытия');
    }

    // Географические подсказки
    const avgLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
    const avgLon = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
    
    if (avgLat > 55 && avgLat < 56 && avgLon > 37 && avgLon < 38) {
      suggestions.push('Московские тропы');
      suggestions.push('Столичные маршруты');
    } else if (avgLat > 59 && avgLat < 60 && avgLon > 30 && avgLon < 31) {
      suggestions.push('Петербургские прогулки');
      suggestions.push('Северная столица');
    }

    // Персональные подсказки
    if (points.length === 2) {
      suggestions.push(`От ${points[0].title} до ${points[1].title}`);
    } else {
      suggestions.push('Мой любимый маршрут');
      suggestions.push('Путешествие с душой');
      suggestions.push('Дорога к открытиям');
    }

    return suggestions.slice(0, 4); // Максимум 4 подсказки
  }, [points]);

  // Валидация названия
  useEffect(() => {
    const trimmedTitle = title.trim();
    
    if (trimmedTitle.length === 0) {
      setValidationError('Название маршрута не может быть пустым');
      setIsValid(false);
      return;
    }
    
    if (trimmedTitle.length < 3) {
      setValidationError('Название должно содержать минимум 3 символа');
      setIsValid(false);
      return;
    }
    
    if (trimmedTitle.length > 100) {
      setValidationError('Название слишком длинное (максимум 100 символов)');
      setIsValid(false);
      return;
    }

    // Проверка на запрещенные слова
    const titleLower = trimmedTitle.toLowerCase();
    const forbiddenWord = FORBIDDEN_WORDS.find(word => titleLower.includes(word));
    
    if (forbiddenWord) {
      setValidationError('Пожалуйста, выберите более уважительное название для вашего маршрута. Это помогает сохранить доброжелательную атмосферу на платформе');
      setIsValid(false);
      return;
    }

    // Проверка на спам (повторяющиеся символы)
    const hasSpam = /(.)\1{4,}/.test(trimmedTitle) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{3,}/.test(trimmedTitle);
    
    if (hasSpam) {
      setValidationError('Пожалуйста, используйте осмысленное название без повторяющихся символов');
      setIsValid(false);
      return;
    }

    setValidationError(null);
    setIsValid(true);
  }, [title]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleTitleChange(suggestion);
  };

  const handleSave = () => {
    if (isValid) {
      onSave();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <FaLightbulb className="text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Как вы назовёте это путешествие?
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Поделитесь своим путём с другими
          </p>
        </div>

        {/* Поле ввода */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Например: «От древности к искусству» или «Путь через века»"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              validationError 
                ? 'border-red-300 focus:ring-red-200' 
                : isValid 
                  ? 'border-green-300 focus:ring-green-200' 
                  : 'border-gray-300 focus:ring-blue-200'
            }`}
            maxLength={100}
          />
          
          {/* Счетчик символов */}
          <div className="text-right text-xs text-gray-500 mt-1">
            {title.length}/100
          </div>
        </div>

        {/* Сообщение об ошибке */}
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{validationError}</p>
            </div>
          </div>
        )}

        {/* Сообщение об успехе */}
        {isValid && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-green-700 text-sm">
                Отличное название! Хорошее название помогает другим понять дух вашего маршрута
              </p>
            </div>
          </div>
        )}

        {/* Подсказки */}
        {suggestions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FaMagic className="text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Предложения названий:</span>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Сохранить маршрут
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteNameInput;
