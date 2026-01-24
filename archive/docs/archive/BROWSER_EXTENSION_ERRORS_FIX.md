# Исправление ошибок расширений браузера

## Проблема

В консоли браузера постоянно появлялись ошибки, связанные с расширениями браузера:
- `Unchecked runtime.lastError: A listener indicated an asynchronous response...`
- `Uncaught (in promise) Error: A listener indicated an asynchronous response...`
- `message channel closed`

Эти ошибки не влияют на работу приложения, но засоряют консоль и мешают отладке реальных проблем.

## Решение

Реализована **централизованная глобальная обработка ошибок** в `frontend/src/main.tsx`, которая:

1. **Автоматически подавляет** все известные ошибки расширений браузера
2. **Логирует только реальные ошибки** приложения
3. **Обрабатывает все типы ошибок:**
   - Синхронные ошибки (`window.onerror`)
   - Необработанные промисы (`unhandledrejection`)
   - Ошибки Service Workers

## Реализация

### Функция проверки ошибок расширений

```typescript
function isBrowserExtensionError(msg: string | Event, reason?: any): boolean {
  const errorMessage = typeof msg === 'string' 
    ? msg 
    : reason?.message || reason?.toString() || '';
  
  const errorString = errorMessage.toLowerCase();
  
  return (
    errorString.includes('message channel closed') ||
    errorString.includes('runtime.lasterror') ||
    errorString.includes('runtime.lastError') ||
    errorString.includes('asynchronous response') ||
    errorString.includes('extension context invalidated') ||
    errorString.includes('receiving end does not exist') ||
    errorString.includes('message port closed')
  );
}
```

### Обработчики ошибок

1. **`window.onerror`** - для синхронных ошибок
2. **`unhandledrejection`** - для необработанных промисов
3. **Service Worker error handlers** - для ошибок Service Workers

## Изменения в файлах

### ✅ `frontend/src/main.tsx`
- Добавлена функция `isBrowserExtensionError()`
- Реализованы глобальные обработчики ошибок
- Добавлена обработка ошибок Service Workers

### ✅ `frontend/src/components/Map/Map.tsx`
- Удалены дублирующие обработчики ошибок (строки 275-308)
- Оставлены локальные проверки в контексте инициализации карты

### ✅ `frontend/src/pages/Posts.tsx`
- Удалены дублирующие обработчики ошибок (строки 50-75)

### ✅ `MAP_FACADE_ARCHITECTURE.md`
- Обновлена документация об автоматическом подавлении ошибок

## Результат

✅ **Консоль браузера теперь чистая** - ошибки расширений не отображаются  
✅ **Реальные ошибки приложения логируются** - для отладки  
✅ **Централизованная обработка** - один источник правды  
✅ **Нет дублирования кода** - удалены локальные обработчики  

## Проверка

После этих изменений:
1. Откройте консоль браузера (F12)
2. Перезагрузите страницу
3. Ошибки `runtime.lastError` и `message channel closed` **не должны появляться**
4. Реальные ошибки приложения будут отображаться как обычно

## Примечания

- Ошибки расширений браузера возникают из-за блокировщиков рекламы, расширений переводчика, и других расширений
- Они не влияют на работу приложения, но мешают отладке
- Теперь они полностью подавляются на уровне приложения

