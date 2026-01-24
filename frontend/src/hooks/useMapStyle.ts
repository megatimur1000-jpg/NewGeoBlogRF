import { useTheme } from '../contexts/ThemeContext';

export const useMapStyle = () => {
  const { isDarkMode } = useTheme();

  return {
    height: '100%',
    minHeight: '400px',
    filter: isDarkMode ? 'invert(90%) hue-rotate(180deg)' : 'none',
  };
}; 