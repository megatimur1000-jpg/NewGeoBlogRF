import React, { useMemo, useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaTrash, FaEye, FaShare } from 'react-icons/fa';
import { EnhancedRouteData } from '../../types/route';

interface RouteEditorProps {
  route: EnhancedRouteData;
  onSave: (routeId: string, updates: Partial<EnhancedRouteData>) => void;
  onDelete: (routeId: string) => void;
  onClose: () => void;
  onShare?: (routeId: string) => void;
}

const RouteEditor: React.FC<RouteEditorProps> = ({ 
  route, 
  onSave, 
  onDelete, 
  onClose, 
  onShare 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoute, setEditedRoute] = useState<EnhancedRouteData>(route);
  const [activeTab, setActiveTab] = useState<'details' | 'points' | 'settings'>('details');
  const [preferredTransport, setPreferredTransport] = useState<string>(() => (route.metadata.transportType?.[0] || 'car'));
  const [fuelType, setFuelType] = useState<'ai95' | 'ai92' | 'diesel'>('ai95');
  const [fuelPriceRub, setFuelPriceRub] = useState<number>(66);
  const [fuelConsumptionLPer100km, setFuelConsumptionLPer100km] = useState<number>(8);

  const transportSpeedsKmh: Record<string, number> = {
    car: 60,
    walk: 5,
    bike: 15,
    bus: 40,
    train: 80
  };

  const fuelPrices: Record<'ai95' | 'ai92' | 'diesel', number> = {
    ai95: 66,
    ai92: 61,
    diesel: 73
  };

  // Унифицированный извлекатель координат для любых форматов точки
  const extractLatLon = (p: any): [number | null, number | null] => {
    const cand: Array<[number | null, number | null]> = [];
    // latitude/longitude
    cand.push([
      Number.isFinite(Number(p?.latitude)) ? Number(p.latitude) : null,
      Number.isFinite(Number(p?.longitude)) ? Number(p.longitude) : null,
    ]);
    // lat/lon(lng)
    cand.push([
      Number.isFinite(Number(p?.lat)) ? Number(p.lat) : null,
      Number.isFinite(Number(p?.lon)) ? Number(p.lon) : (Number.isFinite(Number(p?.lng)) ? Number(p.lng) : null),
    ]);
    // location { lat, lng }
    cand.push([
      Number.isFinite(Number(p?.location?.lat)) ? Number(p.location.lat) : null,
      Number.isFinite(Number(p?.location?.lng)) ? Number(p.location.lng) : null,
    ]);
    // coordinates [a,b] possibly [lat,lon] or [lon,lat]
    if (Array.isArray(p?.coordinates) && p.coordinates.length >= 2) {
      const a = Number(p.coordinates[0]);
      const b = Number(p.coordinates[1]);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        if (Math.abs(a) <= 90 && Math.abs(b) <= 180) cand.push([a, b]);
        if (Math.abs(b) <= 90 && Math.abs(a) <= 180) cand.push([b, a]);
      }
    }
    for (const [lat, lon] of cand) {
      if (lat !== null && lon !== null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) return [lat, lon];
    }
    return [null, null];
  };

  // Вычисление суммарной дистанции по точкам маршрута (км)
  const computedDistanceKm = useMemo(() => {
    const pts = Array.isArray(editedRoute.points) ? editedRoute.points : [];
    if (pts.length < 2) return 0;
    const toRad = (deg: number) => deg * Math.PI / 180;

    let dist = 0;
    for (let i = 1; i < pts.length; i++) {
      const [lat1, lon1] = extractLatLon(pts[i - 1]);
      const [lat2, lon2] = extractLatLon(pts[i]);
      if ([lat1, lon1, lat2, lon2].every(n => typeof n === 'number' && Number.isFinite(n as number))) {
        const R = 6371; // km
        const dLat = toRad((lat2 as number) - (lat1 as number));
        const dLon = toRad((lon2 as number) - (lon1 as number));
        const aa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1 as number)) * Math.cos(toRad(lat2 as number)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
        dist += R * c;
      }
    }
    return Math.round(dist * 10) / 10;
  }, [editedRoute.points]);

  const estimatedDurationHours = useMemo(() => {
    const distance = (Number(editedRoute.metadata.totalDistance) || 0) || computedDistanceKm;
    const speed = transportSpeedsKmh[preferredTransport] || 1;
    const hours = distance > 0 ? distance / speed : 0;
    return Math.round(hours * 10) / 10;
  }, [editedRoute.metadata.totalDistance, preferredTransport, computedDistanceKm]);

  const estimatedCostRub = useMemo(() => {
    const distance = (Number(editedRoute.metadata.totalDistance) || 0) || computedDistanceKm;
    if (preferredTransport !== 'car') return 0;
    const price = Number.isFinite(fuelPriceRub) ? fuelPriceRub : fuelPrices[fuelType];
    const liters = (distance * fuelConsumptionLPer100km) / 100;
    const cost = liters * price;
    return Math.round(cost);
  }, [editedRoute.metadata.totalDistance, preferredTransport, fuelType, fuelConsumptionLPer100km, fuelPriceRub, computedDistanceKm]);

  // Гидратация точек внутри редактора, если пришли пустыми
  React.useEffect(() => {
    const hasPoints = Array.isArray(editedRoute.points) && editedRoute.points.length >= 2;
    if (hasPoints) return;
    const rd: any = (route as any).route_data || {};
    let pts: any[] = Array.isArray(rd.points) ? rd.points : [];
    try {
      // 1) если есть points — нормализуем координаты
      if (Array.isArray(pts) && pts.length > 0) {
        pts = pts.map((p: any, idx: number) => {
          const [lat, lon] = extractLatLon(p);
          return {
            id: p.id || p.markerId || `pt-${idx}`,
            title: p.title || p.name || p.placeName || p.address || `Точка ${idx+1}`,
            latitude: lat,
            longitude: lon,
            description: p.description || ''
          };
        });
      }
      // 2) если points пуст — восстанавливаем по waypoints из избранного (FavoritesContext сериализует в localStorage)
      if ((!Array.isArray(pts) || pts.length < 2) && Array.isArray((route as any).waypoints)) {
        const rawFav = localStorage.getItem('favorites-places');
        const favs: any[] = rawFav ? JSON.parse(rawFav) : [];
        const byId = new Map(favs.map((m: any) => [m.id, m]));
        pts = (route as any).waypoints
          .map((wp: any, idx: number) => {
            const m = byId.get(wp.marker_id);
            if (!m) return null;
            const lat = Array.isArray(m.coordinates) ? Number(m.coordinates[0]) : Number(m.latitude);
            const lon = Array.isArray(m.coordinates) ? Number(m.coordinates[1]) : Number(m.longitude);
            return {
              id: m.id,
              title: m.name || m.title || `Точка ${idx+1}`,
              latitude: Number.isFinite(lat) ? lat : null,
              longitude: Number.isFinite(lon) ? lon : null,
              description: m.location || m.description || ''
            };
          })
          .filter(Boolean);
      }
    } catch {}
    if (Array.isArray(pts) && pts.length >= 2) {
      setEditedRoute(prev => ({ ...prev, points: pts as any }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Дополнительная гидратация: если у точек нет координат/названий — подставляем из маркеров Planner
  React.useEffect(() => {
    try {
      const hasBadPoints = Array.isArray(editedRoute.points) && editedRoute.points.some((p: any, idx: number) => {
        const [lat, lon] = extractLatLon(p);
        const badCoords = !(lat !== null && lon !== null);
        const placeholder = !((p?.title || '').trim()) || /^Точка\s+\d+$/i.test(String(p?.title || ''));
        return badCoords || placeholder;
      });
      if (!hasBadPoints) return;

      const rawPlanner = localStorage.getItem('planner-current-markers');
      const rawSelected = localStorage.getItem('planner-selected-ids');
      const plannerMarkers: Array<{ id: string; title?: string; coordinates: [number, number] }>
        = rawPlanner ? JSON.parse(rawPlanner) : [];
      const selectedIds: string[] = rawSelected ? JSON.parse(rawSelected) : [];
      if (!Array.isArray(plannerMarkers) || plannerMarkers.length === 0) return;

      const byId = new Map(plannerMarkers.map(m => [m.id, m]));
      const ordered = (Array.isArray(selectedIds) && selectedIds.length > 0)
        ? selectedIds.map(id => byId.get(id)).filter(Boolean)
        : plannerMarkers;

      if (ordered.length === 0) return;

      setEditedRoute(prev => ({
        ...prev,
        points: ordered.map((m, idx) => ({
          id: String((m as any).id || `pt-${idx}`),
          title: (m as any).title || `Точка ${idx + 1}`,
          latitude: Number((m as any).coordinates?.[0]) || null,
          longitude: Number((m as any).coordinates?.[1]) || null,
          description: ''
        })) as any
      }));
    } catch {}
  }, []);

  // Явное применение настроек: переносит расчёты в метаданные для отображения в Деталях
  const applySettings = () => {
    setEditedRoute(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        totalDistance: (computedDistanceKm || prev.metadata.totalDistance || 0),
        estimatedDuration: Number.isFinite(estimatedDurationHours) ? estimatedDurationHours : prev.metadata.estimatedDuration,
        estimatedCost: Number.isFinite(estimatedCostRub) ? estimatedCostRub : prev.metadata.estimatedCost,
        transportType: Array.from(new Set([preferredTransport, ...prev.metadata.transportType]))
      }
    }));
    alert('Настройки применены: длительность и стоимость обновлены во вкладке Детали');
  };

  // Автозаполнение Деталей: всегда записываем расчёты при наличии >=2 точек
  React.useEffect(() => {
    const hasPoints = Array.isArray(editedRoute.points) && editedRoute.points.length >= 2;
    if (!hasPoints) return;
    setEditedRoute(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        totalDistance: computedDistanceKm || 0,
        estimatedDuration: estimatedDurationHours || 0,
        estimatedCost: preferredTransport === 'car' ? (estimatedCostRub || 0) : 0
      }
    }));
  }, [computedDistanceKm, estimatedDurationHours, estimatedCostRub, editedRoute.points, preferredTransport]);

  // Однократно при монтировании также применяем расчёты
  React.useEffect(() => {
    const hasPoints = Array.isArray(editedRoute.points) && editedRoute.points.length >= 2;
    if (!hasPoints) return;
    setEditedRoute(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        totalDistance: computedDistanceKm || prev.metadata.totalDistance || 0,
        estimatedDuration: estimatedDurationHours || prev.metadata.estimatedDuration || 0,
        estimatedCost: preferredTransport === 'car' ? (estimatedCostRub || prev.metadata.estimatedCost || 0) : 0
      }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      await onSave(route.id, editedRoute);
      setIsEditing(false);
    } catch (error) {
      }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      try {
        await onDelete(route.id);
        onClose();
      } catch (error) {
        }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(route.id);
    }
  };

  const updateField = (field: keyof EnhancedRouteData, value: any) => {
    setEditedRoute(prev => ({ ...prev, [field]: value }));
  };

  const updateMetadata = (field: keyof typeof route.metadata, value: any) => {
    setEditedRoute(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  const updateSettings = (field: keyof typeof route.settings, value: any) => {
    setEditedRoute(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: value }
    }));
  };

  const renderDetailsTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Название маршрута
        </label>
        <input
          type="text"
          value={editedRoute.title}
          onChange={(e) => updateField('title', e.target.value)}
          disabled={!isEditing}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Описание
        </label>
        <textarea
          value={editedRoute.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          disabled={!isEditing}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Общее расстояние (км)
          </label>
          <input
            type="number"
            value={Number(editedRoute.metadata.totalDistance) || computedDistanceKm || 0}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Продолжительность (часы)
          </label>
          <input
            type="number"
            value={Number(editedRoute.metadata.estimatedDuration) || estimatedDurationHours || 0}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Стоимость (₽)
          </label>
          <input
            type="number"
            value={Number(editedRoute.metadata.estimatedCost) || estimatedCostRub || 0}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сложность (1-5)
          </label>
          <select
            value={editedRoute.metadata.difficultyLevel}
            onChange={(e) => updateMetadata('difficultyLevel', parseInt(e.target.value))}
            disabled={!isEditing}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            {[1, 2, 3, 4, 5].map(level => (
              <option key={level} value={level}>
                {level} - {level === 1 ? 'Легкий' : level === 2 ? 'Простой' : level === 3 ? 'Средний' : level === 4 ? 'Сложный' : 'Экстремальный'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Теги
        </label>
        <input
          type="text"
          value={editedRoute.metadata.tags.join(', ')}
          onChange={(e) => updateMetadata('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
          disabled={!isEditing}
          placeholder="Введите теги через запятую"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      {/* Подсказка: данные отображают фактические расчёты по точкам и параметрам */}
      <div className="text-xs text-gray-500">Поля только для чтения. Значения считаются автоматически по точкам маршрута и выбранным параметрам.</div>
    </div>
  );

  const renderPointsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Точки маршрута</h3>
        <span className="text-sm text-gray-500">
          {editedRoute.points.length} точек
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {editedRoute.points.map((point, index) => {
          const [lat, lon] = extractLatLon(point);
          return (
          <div key={point.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              <div>
                <h4 className="font-medium">{(point as any).title || (point as any).name || (point as any).placeName || (point as any).address || `${Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)) ? `${Number(point.latitude).toFixed(4)}, ${Number(point.longitude).toFixed(4)}` : 'Без названия'}`}</h4>
                <p className="text-sm text-gray-600">{point.description || ''}</p>
                <p className="text-xs text-gray-500">
                  {lat !== null ? lat.toFixed(4) : '—'}, {lon !== null ? lon.toFixed(4) : '—'}
                </p>
              </div>
            </div>
            {isEditing && (
              <button
                onClick={() => {
                  const newPoints = editedRoute.points.filter(p => p.id !== point.id);
                  updateField('points', newPoints);
                }}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
          );
        })}
      </div>

      {editedRoute.points.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Нет точек в маршруте</p>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Предпочтительный транспорт</label>
        <select
          value={preferredTransport}
          onChange={(e) => {
            setPreferredTransport(e.target.value);
            const types = Array.from(new Set([e.target.value, ...editedRoute.metadata.transportType]));
            updateMetadata('transportType', types);
          }}
          disabled={!isEditing}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="car">Автомобиль</option>
          <option value="walk">Пешком</option>
          <option value="bike">Велосипед</option>
          <option value="bus">Общественный транспорт</option>
          <option value="train">Поезд</option>
        </select>
      </div>

      {preferredTransport === 'car' && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип топлива</label>
            <select
              value={fuelType}
              onChange={(e) => {
                const t = e.target.value as 'ai95' | 'ai92' | 'diesel';
                setFuelType(t);
                const price: number = fuelPrices[t];
                setFuelPriceRub(price);
              }}
              disabled={!isEditing}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="ai95">АИ-95</option>
              <option value="ai92">АИ-92</option>
              <option value="diesel">Дизель</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена топлива (₽/л)</label>
            <input
              type="number"
              value={fuelPriceRub}
              onChange={(e) => setFuelPriceRub(parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Расход (л/100км)</label>
            <input
              type="number"
              value={fuelConsumptionLPer100km}
              onChange={(e) => setFuelConsumptionLPer100km(parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>
      )}

      {/* Скорость и длительность отображаются в "Деталях" через автозаполнение */}
      <div className="pt-2">
        <button
          onClick={applySettings}
          className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600`}
        >
          Применить
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FaEdit className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Редактирование маршрута' : 'Просмотр маршрута'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {onShare && (
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                title="Поделиться"
              >
                <FaShare size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Вкладки */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-1">
            {[
              { key: 'details', label: 'Детали', icon: FaEye },
              { key: 'points', label: 'Точки', icon: FaEdit },
              { key: 'settings', label: 'Настройки', icon: FaEdit }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'points' && renderPointsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>

        {/* Кнопки действий */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {activeTab === 'details' ? (
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FaTimes size={14} />
                <span>Закрыть</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FaEdit size={14} />
                    <span>Редактировать</span>
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <FaSave size={14} />
                      <span>Сохранить</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedRoute(route);
                      }}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FaTimes size={14} />
                      <span>Отмена</span>
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaTrash size={14} />
                <span>Удалить</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteEditor;
