import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMap, FaTrafficLight, FaBicycle, FaRegLightbulb, FaPalette } from 'react-icons/fa';

// Скопируй styled-components из AddMarkerAccordionForm.tsx:
const AccordionContainer = styled.div<{ compact?: boolean }>`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px 0 rgba(0,0,0,0.13);
  border: 2px solid #e0e7ef;
  width: 100%;
  max-width: 370px;
  padding: 0;
  display: flex;
  flex-direction: column;
  font-size: ${({ compact }) => (compact ? '13px' : '15px')};
  overflow: hidden;
`;

const StepHeader = styled.div<{ completed: boolean; active: boolean }>`
  /* ... */
`;

const StepContent = styled.div`
  /* ... */
`;

const Select = styled.select`
  /* ... */
`;

const ButtonGroup = styled.div`
  /* ... */
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 18px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-weight: bold;
  background-color: ${props => props.variant === 'primary' ? '#3498db' : '#e74c3c'};
  color: white;
  font-size: 15px;
  box-shadow: 0 2px 8px 0 rgba(52,152,219,0.07);

  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#2980b9' : '#c0392b'};
  }
`;

// === ДОБАВЛЕНО: проп onShowAllMarkers ===
interface MapSettingsAccordionFormProps {
  onShowAllMarkers: () => void;
}

export const MapSettingsAccordionForm: React.FC<MapSettingsAccordionFormProps> = ({ onShowAllMarkers }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [mapType, setMapType] = useState('light');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showBikeLanes, setShowBikeLanes] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [themeColor, setThemeColor] = useState('green');

  const steps = [
    {
      title: 'Вид карты',
      completed: !!mapType,
      content: (
        <Select value={mapType} onChange={e => setMapType(e.target.value)}>
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
          <option value="satellite">Спутник</option>
        </Select>
      ),
      icon: <FaMap />,
    },
    {
      title: 'Показывать пробки',
      completed: true,
      content: (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showTraffic} onChange={e => setShowTraffic(e.target.checked)} />
          <span>Пробки</span>
        </label>
      ),
      icon: <FaTrafficLight />,
    },
    {
      title: 'Показывать велодорожки',
      completed: true,
      content: (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showBikeLanes} onChange={e => setShowBikeLanes(e.target.checked)} />
          <span>Велодорожки</span>
        </label>
      ),
      icon: <FaBicycle />,
    },
    {
      title: 'Показывать подсказки',
      completed: true,
      content: (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showHints} onChange={e => setShowHints(e.target.checked)} />
          <span>Подсказки</span>
        </label>
      ),
      icon: <FaRegLightbulb />,
    },
    {
      title: 'Цветовая схема',
      completed: !!themeColor,
      content: (
        <Select value={themeColor} onChange={e => setThemeColor(e.target.value)}>
          <option value="green">Зелёная</option>
          <option value="blue">Синяя</option>
          <option value="custom">Своя</option>
        </Select>
      ),
      icon: <FaPalette />,
    },
  ];

  return (
    <form>
      <AccordionContainer>
        {steps.map((step, idx) => (
          <React.Fragment key={step.title}>
            <StepHeader
              completed={step.completed}
              active={activeStep === idx}
              onClick={() => setActiveStep(idx)}
            >
              {step.icon}
              <span>{step.title}</span>
              {step.completed && <span style={{ color: '#1e824c', fontWeight: 700 }}>✔</span>}
            </StepHeader>
            {activeStep === idx && (
              <StepContent>
                {step.content}
                <ButtonGroup>
                  {idx > 0 && (
                    <Button type="button" variant="secondary" onClick={() => setActiveStep(idx - 1)}>
                      Назад
                    </Button>
                  )}
                  {idx < steps.length - 1 ? (
                    <Button type="button" variant="primary" onClick={() => setActiveStep(idx + 1)}>
                      Далее
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary">
                      Сохранить
                    </Button>
                  )}
                </ButtonGroup>
              </StepContent>
            )}
          </React.Fragment>
        ))}
      </AccordionContainer>
      {/* === ДОБАВЛЕНО: Кнопка "Показать все метки" === */}
      <Button
        type="button"
        variant="primary"
        style={{ margin: '16px 0', width: '100%' }}
        onClick={onShowAllMarkers}
      >
        Показать все метки
      </Button>
    </form>
  );
};
