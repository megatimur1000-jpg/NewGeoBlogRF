import React, { useState } from 'react';
import { MirrorGradientContainer, usePanelRegistration } from './MirrorGradientProvider';

const MirrorGradientDemo: React.FC = () => {
  const { registerPanel, unregisterPanel } = usePanelRegistration();
  const [panelCount, setPanelCount] = useState(1);

  const addPanel = () => {
    registerPanel();
    setPanelCount(prev => prev + 1);
  };

  const removePanel = () => {
    if (panelCount > 1) {
      unregisterPanel();
      setPanelCount(prev => prev - 1);
    }
  };

  return (
    <MirrorGradientContainer>
      <div className="page-header">
        <div className="flex items-center justify-center">
          <h1 className="text-3xl font-bold text-gradient">Демо зеркального градиента</h1>
        </div>
      </div>

      <div className="page-main-area">
        <div className="page-content-wrapper">
          <div className="deep-container p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-4">Количество панелей: {panelCount}</h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={addPanel}
                  className="gradient-button px-4 py-2"
                >
                  Добавить панель
                </button>
                <button
                  onClick={removePanel}
                  disabled={panelCount <= 1}
                  className="deep-button px-4 py-2 disabled:opacity-50"
                >
                  Убрать панель
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: panelCount }, (_, index) => (
                <div key={index} className="deep-card p-6">
                  <h3 className="text-lg font-semibold mb-3">Панель {index + 1}</h3>
                  <p className="text-gray-600">
                    Это демонстрационная панель. Обратите внимание на плавный переход градиента между панелями.
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 deep-panel">
              <h3 className="text-lg font-semibold mb-3">Как это работает</h3>
              <p className="text-gray-600 mb-4">
                Зеркальный градиент автоматически адаптируется к количеству панелей:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>1 панель:</strong> Обычный градиент</li>
                <li><strong>2 панели:</strong> Градиент с плавным переходом в центре</li>
                <li><strong>3 панели:</strong> Градиент с двумя зонами перехода</li>
                <li><strong>4+ панели:</strong> Расширенные зоны перехода</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MirrorGradientContainer>
  );
};

export default MirrorGradientDemo; 