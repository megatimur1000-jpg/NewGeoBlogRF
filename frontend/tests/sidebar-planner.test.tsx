import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '../src/components/Sidebar';
import { LayoutProvider } from '../src/contexts/LayoutContext';
import { useContentStore } from '../src/stores/contentStore';

// Простая тестовая обёртка, проверяет что по клику открывается planner
test('Sidebar opens planner and navigates to /planner', async () => {
  // Сбрасываем состояние стора
  useContentStore.setState({ leftContent: null, rightContent: 'posts' });

  const { getByText } = render(
    <MemoryRouter initialEntries={["/"]}>
      <LayoutProvider>
        <Sidebar />
        <Routes>
          <Route path="/planner" element={<div data-testid="planner-page">PLANNER</div>} />
          <Route path="/" element={<div data-testid="home">HOME</div>} />
        </Routes>
      </LayoutProvider>
    </MemoryRouter>
  );

  // Находим кнопку по тексту (появляется только при раскрытии сайдбара - симулируем клик по сайдбару для раскрытия)
  const sidebar = getByText('Навигация');
  fireEvent.click(sidebar);

  // Теперь кликаем по кнопке Планировщик
  const plannerBtn = getByText('Планировщик');
  fireEvent.click(plannerBtn);

  await waitFor(() => {
    // Проверяем состояние стора
    const s = useContentStore.getState();
    expect(s.leftContent).toBe('planner');
  });
});
