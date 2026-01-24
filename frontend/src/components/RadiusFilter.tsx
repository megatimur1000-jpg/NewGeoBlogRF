import React from 'react';

interface RadiusFilterProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

const RadiusFilter: React.FC<RadiusFilterProps> = ({
  value, min = 1, max = 20, step = 1, onChange
}) => (
  <div style={{ marginBottom: 16 }}>
    <label>Радиус поиска: {value} км</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%' }}
    />
  </div>
);

export default RadiusFilter;
