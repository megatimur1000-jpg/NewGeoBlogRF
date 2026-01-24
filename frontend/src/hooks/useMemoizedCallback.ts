import { useCallback, useRef, useMemo } from 'react';

interface MemoizationOptions {
  maxSize?: number;
  equalityFn?: (a: any, b: any) => boolean;
}

// Глубокое сравнение объектов
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return false;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

// LRU кэш для мемоизации
class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
  options: MemoizationOptions = {}
): T {
  const { maxSize = 100, equalityFn = deepEqual } = options;
  
  const cacheRef = useRef<LRUCache<string, T>>(new LRUCache(maxSize));
  const depsRef = useRef<any[]>([]);
  const callbackRef = useRef<T>(callback);
  
  // Обновляем ссылку на callback
  callbackRef.current = callback;
  
  // Создаем ключ для кэша на основе зависимостей
  const cacheKey = useMemo(() => {
    return JSON.stringify(deps);
  }, deps);
  
  // Проверяем кэш
  const cachedCallback = cacheRef.current.get(cacheKey);
  if (cachedCallback && depsRef.current.length > 0) {
    const depsEqual = deps.every((dep, index) => 
      equalityFn(dep, depsRef.current[index])
    );
    
    if (depsEqual) {
      return cachedCallback;
    }
  }
  
  // Создаем новый мемоизированный callback
  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, deps) as T;
  
  // Кэшируем результат
  cacheRef.current.set(cacheKey, memoizedCallback);
  depsRef.current = [...deps];
  
  return memoizedCallback;
}

// Хук для очистки кэша
export function useClearMemoizationCache() {
  const cacheRef = useRef<LRUCache<string, any>>();
  
  return useCallback(() => {
    if (cacheRef.current) {
      cacheRef.current.clear();
    }
  }, []);
}

export default useMemoizedCallback;

