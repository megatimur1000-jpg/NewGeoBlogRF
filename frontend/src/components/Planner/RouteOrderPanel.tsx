import React, { useEffect, useMemo, useState } from 'react';

type CandidatePoint = {
  id: string;
  title: string;
  coordinates: [number, number];
  description?: string;
  source: 'favorites' | 'click' | 'search' | 'route';
  sourceId?: string;
};

interface RouteOrderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidatePoint[];
  initialSelectedIds?: string[];
  onApply: (orderedSelectedIds: string[]) => void;
}

const RouteOrderPanel: React.FC<RouteOrderPanelProps> = ({ isOpen, onClose, candidates, initialSelectedIds = [], onApply }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [orderIds, setOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const uniq = Array.from(new Set([
      ...initialSelectedIds,
      ...candidates.map(c => c.id)
    ]));
    setOrderIds(uniq);
    setSelectedIds(initialSelectedIds.length > 0 ? initialSelectedIds : candidates.map(c => c.id));
  }, [isOpen, candidates, initialSelectedIds]);

  const byId = useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates]);
  const visibleList = orderIds
    .map(id => byId.get(id))
    .filter(Boolean) as CandidatePoint[];

  const move = (id: string, dir: -1 | 1) => {
    const idx = orderIds.indexOf(id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= orderIds.length) return;
    const copy = [...orderIds];
    [copy[idx], copy[to]] = [copy[to], copy[idx]];
    setOrderIds(copy);
  };

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const apply = () => {
    const finalOrder = orderIds.filter(id => selectedIds.includes(id));
    onApply(finalOrder);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Порядок следования по маршруту</h3>
          <button onClick={onClose} className="px-2 py-1 text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {visibleList.length === 0 ? (
            <div className="text-sm text-gray-500">Нет точек. Выберите метки в избранном, добавьте кликом или через поиск.</div>
          ) : (
            visibleList.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggle(p.id)} />
                  <div>
                    <div className="text-sm font-medium">{idx + 1}. {p.title}</div>
                    <div className="text-xs text-gray-500">{p.source} · [{p.coordinates[0].toFixed(4)}, {p.coordinates[1].toFixed(4)}]</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => move(p.id, -1)} title="Вверх">↑</button>
                  <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => move(p.id, 1)} title="Вниз">↓</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 border rounded">Отмена</button>
          <button onClick={apply} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Применить</button>
        </div>
      </div>
    </div>
  );
};

export default RouteOrderPanel;


