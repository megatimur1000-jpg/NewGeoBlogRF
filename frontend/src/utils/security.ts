// Утилиты для безопасности и защиты от XSS

/**
 * Санитизация HTML контента
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Экранирование HTML символов
 */
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
};

/**
 * Валидация email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Очистка пользовательского ввода
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Удаляем угловые скобки
    .replace(/javascript:/gi, '') // Удаляем javascript: протоколы
    .replace(/on\w+\s*=/gi, '') // Удаляем обработчики событий
    .substring(0, 1000); // Ограничиваем длину
};

/**
 * Проверка на потенциально опасный контент
 */
export const isDangerousContent = (content: string): boolean => {
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /<style/gi
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(content));
};

/**
 * Безопасное создание HTML атрибутов
 */
export const createSafeAttributes = (attrs: { [key: string]: string }): string => {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ');
};
