import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useContentStore, ContentType } from '../stores/contentStore';

type ContentId = string | null;

interface ChatWindow {
  id: string;
  userId: string;
  username: string;
}

// Интерфейс для данных маршрута, передаваемых в блог
interface RouteDataForBlog {
  title: string;
  points: Array<{
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    description?: string;
  }>;
  totalDistance?: number;
  estimatedDuration?: number;
  polyline?: [number, number][];
}

// Интерфейс для данных метки, передаваемых в блог
interface MarkerDataForBlog {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
  address?: string;
  hashtags?: string[];
  photoUrls?: string[];
}

interface LayoutContextType {
  // Состояние панелей теперь берется из store (для обратной совместимости)
  leftContent: ContentType;
  rightContent: ContentType;
  chatWindows: ChatWindow[];
  routeDataForBlog: RouteDataForBlog | null;
  markerDataForBlog: MarkerDataForBlog | null;
  selectedRouteId: number | null;
  currentRouteId: number | null;
  currentMarkerId: number | null;
  currentEventId: number | null;
  // Методы управления панелями теперь делегируются в store
  setLeftContent: (id: ContentId) => void;
  setRightContent: (id: ContentId) => void;
  openLeftPanel: (id: ContentId) => void;
  closeLeftPanel: () => void;
  openRightPanel: (id: ContentId) => void;
  closeRightPanel: () => void;
  toggleLeftPanel: (id: ContentId) => void;
  toggleRightPanel: (id: ContentId) => void;
  addChatWindow: (userId: string, username: string) => void;
  removeChatWindow: (id: string) => void;
  setRouteDataForBlog: (data: RouteDataForBlog | null) => void;
  setMarkerDataForBlog: (data: MarkerDataForBlog | null) => void;
  resetAllPanels: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Используем store для управления панелями
  const leftContent = useContentStore((state) => state.leftContent);
  const rightContent = useContentStore((state) => state.rightContent);
  const setLeftContentStore = useContentStore((state) => state.setLeftContent);
  const setRightContentStore = useContentStore((state) => state.setRightContent);
  const openLeftPanelStore = useContentStore((state) => state.openLeftPanel);
  const closeLeftPanelStore = useContentStore((state) => state.closeLeftPanel);
  const openRightPanelStore = useContentStore((state) => state.openRightPanel);
  const closeRightPanelStore = useContentStore((state) => state.closeRightPanel);
  const toggleLeftPanelStore = useContentStore((state) => state.toggleLeftPanel);
  const toggleRightPanelStore = useContentStore((state) => state.toggleRightPanel);
  const resetAllPanelsStore = useContentStore((state) => state.resetAllPanels);
  
  // Локальные состояния для вспомогательных функций
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [routeDataForBlog, setRouteDataForBlog] = useState<RouteDataForBlog | null>(null);
  const [markerDataForBlog, setMarkerDataForBlog] = useState<MarkerDataForBlog | null>(null);
  
  // Новые состояния для постов
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [currentRouteId, setCurrentRouteId] = useState<number | null>(null);
  const [currentMarkerId, setCurrentMarkerId] = useState<number | null>(null);
  const [currentEventId, setCurrentEventId] = useState<number | null>(null);

  // Обертки для обратной совместимости - делегируем в store
  const memoizedSetLeftContent = useCallback((id: ContentId) => {
    setLeftContentStore(id as ContentType);
  }, [setLeftContentStore]);

  const memoizedSetRightContent = useCallback((id: ContentId) => {
    setRightContentStore(id as ContentType);
  }, [setRightContentStore]);

  const openLeftPanel = useCallback((id: ContentId) => {
    openLeftPanelStore(id as ContentType);
  }, [openLeftPanelStore]);

  const closeLeftPanel = useCallback(() => {
    closeLeftPanelStore();
  }, [closeLeftPanelStore]);

  const openRightPanel = useCallback((id: ContentId) => {
    openRightPanelStore(id as ContentType);
  }, [openRightPanelStore]);

  const closeRightPanel = useCallback(() => {
    closeRightPanelStore();
  }, [closeRightPanelStore]);

  const toggleLeftPanel = useCallback((id: ContentId) => {
    toggleLeftPanelStore(id as ContentType);
  }, [toggleLeftPanelStore]);

  const toggleRightPanel = useCallback((id: ContentId) => {
    toggleRightPanelStore(id as ContentType);
  }, [toggleRightPanelStore]);

  const addChatWindow = useCallback((userId: string, username: string) => {
    const newChat: ChatWindow = {
      id: `chat-${Date.now()}`,
      userId,
      username
    };
    setChatWindows(prev => [...prev, newChat]);
  }, []);

  const removeChatWindow = useCallback((id: string) => {
    setChatWindows(prev => prev.filter(chat => chat.id !== id));
  }, []);

  const resetAllPanels = useCallback(() => {
    resetAllPanelsStore();
  }, [resetAllPanelsStore]);

  const contextValue = useMemo(() => ({
    leftContent,
    rightContent,
    chatWindows,
    routeDataForBlog,
    markerDataForBlog,
    selectedRouteId,
    currentRouteId,
    currentMarkerId,
    currentEventId,
    setLeftContent: memoizedSetLeftContent,
    setRightContent: memoizedSetRightContent,
    openLeftPanel,
    closeLeftPanel,
    openRightPanel,
    closeRightPanel,
    toggleLeftPanel,
    toggleRightPanel,
    addChatWindow,
    removeChatWindow,
    setRouteDataForBlog,
    setMarkerDataForBlog,
    resetAllPanels,
  }), [
    leftContent,
    rightContent,
    chatWindows,
    routeDataForBlog,
    markerDataForBlog,
    selectedRouteId,
    currentRouteId,
    currentMarkerId,
    currentEventId,
    memoizedSetLeftContent,
    memoizedSetRightContent,
    openLeftPanel,
    closeLeftPanel,
    openRightPanel,
    closeRightPanel,
    toggleLeftPanel,
    toggleRightPanel,
    addChatWindow,
    removeChatWindow,
    setRouteDataForBlog,
    resetAllPanels,
  ]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutState = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    // Возвращаем заглушку с использованием store для обратной совместимости
    const store = useContentStore.getState();
    return {
      leftContent: store.leftContent,
      rightContent: store.rightContent,
      chatWindows: [],
      routeDataForBlog: null,
      markerDataForBlog: null,
      selectedRouteId: null,
      currentRouteId: null,
      currentMarkerId: null,
      currentEventId: null,
      setLeftContent: (id: ContentId) => { 
        store.setLeftContent(id as ContentType);
      },
      setRightContent: (id: ContentId) => { 
        store.setRightContent(id as ContentType);
      },
      openLeftPanel: (id: ContentId) => store.openLeftPanel(id as ContentType),
      closeLeftPanel: () => store.closeLeftPanel(),
      openRightPanel: (id: ContentId) => store.openRightPanel(id as ContentType),
      closeRightPanel: () => store.closeRightPanel(),
      toggleLeftPanel: (id: ContentId) => store.toggleLeftPanel(id as ContentType),
      toggleRightPanel: (id: ContentId) => store.toggleRightPanel(id as ContentType),
      addChatWindow: () => {},
      removeChatWindow: () => {},
      setRouteDataForBlog: () => {},
      setMarkerDataForBlog: () => {},
      resetAllPanels: () => store.resetAllPanels(),
    };
  }
  return context;
}; 