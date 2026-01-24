/**
 * Хук для работы с географическими ограничениями РФ
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  isWithinRussiaBounds, 
  validateRouteCoordinates, 
  getRussiaBoundsErrorMessage,
  getNearestRussiaCity,
  RUSSIA_CENTER,
  RUSSIA_BOUNDS
} from '../utils/russiaBounds';
import { RUSSIA_COMPLIANCE_SETTINGS } from '../config/russia';
import { RouteValidationResult, CoordinateValidationResult } from '../types/russia';

interface UseRussiaRestrictionsReturn {
  // Проверки координат
  checkCoordinates: (lat: number, lng: number) => CoordinateValidationResult;
  checkRouteCoordinates: (coordinates: [number, number][]) => RouteValidationResult;
  
  // Настройки карты
  getMapCenter: () => { lat: number; lng: number };
  getMapBounds: () => typeof RUSSIA_BOUNDS;
  
  // Состояние ограничений
  restrictionsEnabled: boolean;
  strictMode: boolean;
  
  // Утилиты
  getErrorMessage: (lat: number, lng: number) => string;
  getNearestCity: (lat: number, lng: number) => any;
}

export const useRussiaRestrictions = (): UseRussiaRestrictionsReturn => {
  const [restrictionsEnabled] = useState(RUSSIA_COMPLIANCE_SETTINGS.geographicRestrictions.enabled);
  const [strictMode] = useState(RUSSIA_COMPLIANCE_SETTINGS.geographicRestrictions.strictMode);

  // Проверка координат на соответствие границам РФ
  const checkCoordinates = useCallback((lat: number, lng: number): CoordinateValidationResult => {
    if (!restrictionsEnabled) {
      return { isValid: true };
    }

    const isValid = isWithinRussiaBounds(lat, lng);
    
    if (!isValid) {
      const errorMessage = getRussiaBoundsErrorMessage(lat, lng);
      const nearestCity = getNearestRussiaCity(lat, lng);
      
      return {
        isValid: false,
        errorMessage,
        nearestCity
      };
    }

    return { isValid: true };
  }, [restrictionsEnabled]);

  // Проверка массива координат для маршрута
  const checkRouteCoordinates = useCallback((coordinates: [number, number][]): RouteValidationResult => {
    if (!restrictionsEnabled) {
      return { isValid: true, invalidPoints: [] };
    }

    return validateRouteCoordinates(coordinates);
  }, [restrictionsEnabled]);

  // Получение центра карты по умолчанию
  const getMapCenter = useCallback(() => {
    return {
      lat: RUSSIA_CENTER.latitude,
      lng: RUSSIA_CENTER.longitude
    };
  }, []);

  // Получение границ карты
  const getMapBounds = useCallback(() => {
    return RUSSIA_BOUNDS;
  }, []);

  // Получение сообщения об ошибке
  const getErrorMessage = useCallback((lat: number, lng: number): string => {
    return getRussiaBoundsErrorMessage(lat, lng);
  }, []);

  // Получение ближайшего города
  const getNearestCity = useCallback((lat: number, lng: number) => {
    return getNearestRussiaCity(lat, lng);
  }, []);

  return {
    checkCoordinates,
    checkRouteCoordinates,
    getMapCenter,
    getMapBounds,
    restrictionsEnabled,
    strictMode,
    getErrorMessage,
    getNearestCity
  };
};

export default useRussiaRestrictions;
