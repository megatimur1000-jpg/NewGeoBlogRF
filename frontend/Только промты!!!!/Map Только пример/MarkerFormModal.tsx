import React, { useEffect, useMemo, useState } from 'react';
import { checkPoint } from '../../services/zoneService';
import { MarkerData } from '../../types/marker';
import { useIncompleteMarkers } from '../../hooks/useMarkerCompleteness';

interface MarkerFormModalProps {
  mode: 'add' | 'edit' | 'suggest';
  initialData?: Partial<MarkerData>;
  onSubmit: (data: Partial<MarkerData>) => void;
  onCancel: () => void;
}

const MarkerFormModal: React.FC<MarkerFormModalProps> = ({ mode, initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MarkerData>>(initialData);
  const { fetchIncompleteMarkers } = useIncompleteMarkers();
  const [nearbyIncomplete, setNearbyIncomplete] = useState<any[]>([]);
  const [isCheckingNearby, setIsCheckingNearby] = useState(false);
  const canCheckDuplicates = useMemo(() => typeof formData.latitude === 'number' && typeof formData.longitude === 'number' && (formData.title || '').length >= 3, [formData.latitude, formData.longitude, formData.title]);

  // Подгружаем неподполные метки рядом при готовности данных
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canCheckDuplicates) {
        setNearbyIncomplete([]);
        return;
      }
      try {
        setIsCheckingNearby(true);
        const token = localStorage.getItem('token') || '';
        const data = await fetchIncompleteMarkers({
          minScore: 0,
          maxScore: 80,
          limit: 5
        }, token);
        if (!cancelled) {
          // Если API useIncompleteMarkers не учитывает координаты, запросим специализированный эндпоинт
          if (typeof formData.latitude === 'number' && typeof formData.longitude === 'number') {
            const url = new URL('/api/markers/nearby-incomplete', window.location.origin);
            url.searchParams.set('latitude', String(formData.latitude));
            url.searchParams.set('longitude', String(formData.longitude));
            if (formData.category) url.searchParams.set('category', String(formData.category));
            url.searchParams.set('radius', '500');
            const resp = await fetch(url.toString(), {
              headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });
            if (resp.ok) {
              const resJson = await resp.json();
              setNearbyIncomplete(resJson?.data?.markers || []);
            } else {
              setNearbyIncomplete(data?.markers || []);
            }
          } else {
            setNearbyIncomplete(data?.markers || []);
          }
        }
      } catch (_) {
        if (!cancelled) setNearbyIncomplete([]);
      } finally {
        if (!cancelled) setIsCheckingNearby(false);
      }
    })();
    return () => { cancelled = true; };
  }, [canCheckDuplicates, formData.latitude, formData.longitude, formData.category, fetchIncompleteMarkers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Дубликаты/альтернативы: мягкая проверка на бэкенде (если есть координаты)
      if (canCheckDuplicates) {
        try {
          const token = localStorage.getItem('token') || '';
          const resp = await fetch('/api/markers/validate-creation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
              latitude: formData.latitude,
              longitude: formData.longitude,
              title: formData.title,
              category: formData.category || 'other',
              description: formData.description || ''
            })
          });
          if (resp.ok) {
            const result = await resp.json();
            if (!result.success) {
              alert(result.message || 'Ошибка валидации метки');
              return;
            }
            const { canCreate, validation, recommendation } = result.data || {};
            if (validation?.issues?.length) {
              const msg = validation.issues.map((i: any) => `- ${i.message}`).join('\n');
              alert(`Найдены проблемы:\n${msg}`);
              if (!canCreate) return;
            }
            if (recommendation?.action === 'block') {
              alert('Создание метки заблокировано: найден точный дубликат рядом.');
              return;
            }
            if (recommendation?.action === 'warn' || validation?.warnings?.length) {
              const warn = validation?.warnings?.map((w: any) => `- ${w.message}`).join('\n') || 'Обнаружены потенциальные дубликаты поблизости.';
              const proceed = window.confirm(`${warn}\n\nПродолжить создание новой метки?`);
              if (!proceed) return;
            }
          }
        } catch (_) {
          // если валидация недоступна — продолжаем
        }
      }
      if (typeof formData.longitude === 'number' && typeof formData.latitude === 'number') {
        const res = await checkPoint(formData.latitude, formData.longitude);
        const hasRestrictions = Array.isArray(res) && res.length > 0;
        if (hasRestrictions) {
          const zoneNames = res.flatMap((r: any) => r.zones?.map((z: any) => z.name)).filter(Boolean).join(', ');
          const proceed = window.confirm(`Вы пытаетесь сохранить объект в зоне с ограничениями: ${zoneNames || 'неизвестно'}. Продолжить?`);
          if (!proceed) return;
        }
      }
    } catch (_) {
      // молча продолжаем, если проверка недоступна
    }
    onSubmit(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>
          {mode === 'edit' && 'Редактировать метку'}
          {mode === 'add' && 'Добавить метку'}
          {mode === 'suggest' && 'Предложить изменения'}
        </h2>
        <form onSubmit={handleSubmit}>
          <label>
            Название:
            <input name="title" value={formData.title || ''} onChange={handleChange} required />
          </label>
          <label>
            Описание:
            <textarea name="description" value={formData.description || ''} onChange={handleChange} required />
          </label>
          {/* Подсказки: рядом есть неполные метки */}
          {canCheckDuplicates && (
            <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💡 Рядом есть неполные метки — можно дополнить вместо создания</span>
                {isCheckingNearby && <span style={{ color: '#6b7280', fontWeight: 400 }}>Проверяем…</span>}
              </div>
              {nearbyIncomplete.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 13 }}>Неполных меток поблизости не найдено.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {nearbyIncomplete.slice(0, 3).map((m: any) => (
                    <div key={m.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 600 }}>{m.title || 'Без названия'}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Полнота: {m.completenessScore ?? m.completeness_score ?? 0}% • {typeof m.distance === 'number' ? `${m.distance}м` : 'рядом'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => window.alert('Открытие существующей метки пока не реализовано здесь. Откройте её на карте и нажмите "Редактировать".')}
                          style={{ padding: '6px 10px', background: '#8e44ad', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Дополнить</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Вы всё равно можете создать новую метку ниже.</div>
                </div>
              )}
            </div>
          )}
          {/* Можно добавить другие поля по необходимости */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={onCancel}>Отмена</button>
            <button type="submit">Сохранить</button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 3000;
        }
        .modal-content {
          background: #fff; border-radius: 10px; padding: 24px; min-width: 320px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
        label { display: block; margin-bottom: 12px; }
        input, textarea { width: 100%; margin-top: 4px; }
      `}</style>
    </div>
  );
};

export default MarkerFormModal;
