import React from 'react';

interface CircularProgressBarProps {
  value: number; // 0-100
  size?: number; // px
  strokeWidth?: number; // px
  color?: string;
  bgColor?: string;
  textColor?: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value,
  size = 64,
  strokeWidth = 8,
  color = '#4cc790',
  bgColor = '#e6e6e6',
  textColor = '#222'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        fontSize={size * 0.28}
        fill={textColor}
        fontWeight="bold"
      >
        {`${Math.round(value)}%`}
      </text>
    </svg>
  );
};

export default CircularProgressBar;
