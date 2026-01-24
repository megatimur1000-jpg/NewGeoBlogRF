import React from 'react';
import { FaCrown, FaCheckCircle, FaTimes } from 'react-icons/fa';
import './PremiumScreen.css';

interface PremiumScreenProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // Название функции, для которой требуется Premium
}

const PremiumScreen: React.FC<PremiumScreenProps> = ({ isOpen, onClose, feature }) => {
  if (!isOpen) return null;

  const features = [
    'Офлайн-режим: скачивайте карты и пользуйтесь без интернета',
    'Скачивание региональных карт: ваши данные + офлайн-карты',
    'Приоритетная поддержка',
    'Расширенные возможности планирования маршрутов',
    'Эксклюзивные функции и обновления'
  ];

  return (
    <div className="premium-screen-overlay" onClick={onClose}>
      <div className="premium-screen-content" onClick={(e) => e.stopPropagation()}>
        <button className="premium-screen-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="premium-screen-header">
          <FaCrown className="premium-screen-crown" />
          <h2 className="premium-screen-title">Офлайн-режим доступен в Premium</h2>
          {feature && (
            <p className="premium-screen-subtitle">
              Функция «{feature}» доступна только для Premium-пользователей
            </p>
          )}
        </div>

        <div className="premium-screen-features">
          <h3 className="premium-screen-features-title">Что включено в Premium:</h3>
          <ul className="premium-screen-features-list">
            {features.map((feature, index) => (
              <li key={index} className="premium-screen-feature-item">
                <FaCheckCircle className="premium-screen-feature-icon" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="premium-screen-actions">
          <button className="premium-screen-button premium-screen-button-primary">
            Перейти к Premium
          </button>
          <button
            className="premium-screen-button premium-screen-button-secondary"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumScreen;

