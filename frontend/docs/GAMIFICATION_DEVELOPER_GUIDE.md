# 🎮 Полное руководство по системе геймификации

**Для разработчика: как работать с геймификацией, добавлять новые функции, бусты и разделы**

---

## 📚 Содержание

1. [Архитектура системы](#архитектура-системы)
2. [Структура файлов](#структура-файлов)
3. [Как работает начисление XP](#как-работает-начисление-xp)
4. [Добавление новых источников XP](#добавление-новых-источников-xp)
5. [Добавление новых бустов](#добавление-новых-бустов)
6. [Добавление новых достижений](#добавление-новых-достижений)
7. [Добавление новых ежедневных целей](#добавление-новых-ежедневных-целей)
8. [Добавление новых рангов](#добавление-новых-рангов)
9. [Интеграция в новые компоненты](#интеграция-в-новые-компоненты)
10. [Backend API](#backend-api)
11. [Отладка и тестирование](#отладка-и-тестирование)

---

## 🏗️ Архитектура системы

### Принцип работы

```
Пользователь создаёт контент
    ↓
PostsService/MarkerService
    ↓
gamificationHelper (автоматически)
    ↓
gamificationFacade (проверка уникальности, модерация)
    ↓
Backend API (/api/gamification/xp)
    ↓
База данных (user_levels, xp_history)
    ↓
GamificationContext (обновление UI)
    ↓
Компоненты (LevelCard, DailyGoalsWidget)
```

### Ключевые компоненты

1. **GamificationFacade** - главный фасад, проверяет уникальность, модерацию, лимиты
2. **GamificationContext** - React Context для управления состоянием
3. **gamificationHelper** - хелперы для автоматического начисления XP
4. **Backend API** - эндпоинты для работы с БД
5. **UI компоненты** - отображение уровня, целей, достижений

---

## 📁 Структура файлов

### Frontend

```
frontend/src/
├── types/
│   └── gamification.ts              # Все типы для геймификации
│
├── config/
│   └── xpSources.ts                 # Конфигурация источников XP
│
├── services/
│   └── gamificationFacade.ts        # Фасад геймификации (главный!)
│
├── contexts/
│   └── GamificationContext.tsx      # React Context
│
├── hooks/
│   ├── useLevelProgress.ts          # Хук для уровня
│   ├── useDailyGoals.ts             # Хук для целей
│   └── useAchievements.ts           # Хук для достижений
│
├── components/Gamification/
│   ├── LevelCard.tsx                 # Карточка уровня
│   ├── DailyGoalsWidget.tsx         # Виджет целей
│   ├── XPNotification.tsx           # Уведомления XP
│   └── LevelUpAnimation.tsx         # Анимация повышения уровня
│
├── utils/
│   ├── xpCalculator.ts              # Расчёты XP и уровней
│   ├── dailyGoalGenerator.ts        # Генератор целей
│   └── gamificationHelper.ts        # Хелперы для начисления XP
│
└── services/
    ├── postsService.ts               # Интеграция геймификации
    └── markerService.ts              # Интеграция геймификации
```

### Backend

```
backend/
├── create_gamification_tables.sql    # SQL схема
├── src/
│   ├── routes/
│   │   └── gamificationRoutes.js     # API роуты
│   ├── controllers/
│   │   └── gamificationController.js # Логика обработки
│   └── utils/
│       └── xpCalculator.js          # Расчёты (Backend версия)
```

---

## 💰 Как работает начисление XP

### Автоматическое начисление

Когда пользователь создаёт пост или метку, автоматически вызывается:

```typescript
// В postsService.ts или markerService.ts
import('../utils/gamificationHelper').then(({ addXPForPost }) => {
  addXPForPost(post.id, {
    hasPhoto: true,
    hasMarker: true,
    userId: user.id,
  });
});
```

### Процесс начисления

1. **gamificationHelper** вызывает `gamificationFacade.addXP()`
2. **GamificationFacade** проверяет:
   - ✅ Уникальность действия (не повторяется ли)
   - ✅ Модерацию (одобрен ли контент)
   - ✅ Лимиты (не превышен ли дневной лимит)
   - ✅ Кулердаун (прошло ли достаточно времени)
3. Если всё ОК → отправляет запрос на Backend API
4. Backend сохраняет в БД и возвращает результат
5. Frontend обновляет UI через GamificationContext

### Пример потока

```
Пользователь создаёт пост с фото
    ↓
postsService.createPost() → post.id = "123"
    ↓
gamificationHelper.addXPForPost("123", { hasPhoto: true })
    ↓
gamificationFacade.addXP({ source: 'post_created', amount: 50 })
    ↓
Проверка уникальности → OK
    ↓
POST /api/gamification/xp
    ↓
Backend сохраняет в БД
    ↓
GamificationContext обновляет userLevel
    ↓
LevelCard перерисовывается с новым XP
```

---

## ➕ Добавление новых источников XP

### Шаг 1: Добавить в конфигурацию

Откройте `frontend/src/config/xpSources.ts`:

```typescript
export const XP_SOURCES: Record<XPSource, XPSourceConfig> = {
  // ... существующие источники
  
  // НОВЫЙ ИСТОЧНИК
  new_action: {
    id: 'new_action',
    name: 'Новое действие',
    description: 'За выполнение нового действия',
    baseAmount: 100,                    // Базовое количество XP
    category: 'content',                // 'content' | 'quality' | 'activity' | 'achievement'
    requiresModeration: true,           // Требует ли модерацию
    cooldown: 60,                      // Кулердаун в секундах (опционально)
    dailyLimit: 10,                     // Максимум раз в день (опционально)
  },
};
```

### Шаг 2: Добавить тип

Откройте `frontend/src/types/gamification.ts`:

```typescript
export type XPSource = 
  | 'post_created'
  | 'marker_created'
  // ... существующие
  | 'new_action';  // ← ДОБАВИТЬ СЮДА
```

### Шаг 3: Создать хелпер (если нужно)

Откройте `frontend/src/utils/gamificationHelper.ts`:

```typescript
/**
 * Добавить XP за новое действие
 */
export async function addXPForNewAction(actionId: string, options: {
  userId: string;
  // ... другие параметры
}): Promise<void> {
  try {
    if (!options.userId) {
      console.warn('GamificationHelper: userId не указан');
      return;
    }

    await gamificationFacade.addXP({
      userId: options.userId,
      source: 'new_action',
      amount: 100,
      contentId: actionId,
      contentType: 'action', // или другой тип
      metadata: {
        // дополнительные данные
      },
    });
  } catch (error) {
    console.error('GamificationHelper.addXPForNewAction error:', error);
  }
}
```

### Шаг 4: Интегрировать в сервис

В вашем сервисе (например, `newService.ts`):

```typescript
import { addXPForNewAction } from '../utils/gamificationHelper';

export const createNewAction = async (data: any) => {
  const response = await apiClient.post('/new-actions', data);
  const action = response.data;
  
  // Интеграция геймификации
  if (action?.id) {
    import('../utils/gamificationHelper').then(({ addXPForNewAction }) => {
      const token = localStorage.getItem('token');
      let userId = action.user_id || undefined;
      
      if (!userId && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || payload.id || undefined;
        } catch (e) {}
      }
      
      if (userId) {
        addXPForNewAction(action.id, { userId }).catch(err => 
          console.error('Gamification error:', err)
        );
      }
    });
  }
  
  return action;
};
```

---

## 🚀 Добавление новых бустов

### Что такое буст?

Буст - это дополнительный XP за выполнение условий. Например:
- Пост с фото: +25 XP
- Метка с описанием: +15 XP
- Высокое качество: +10 XP

### Как добавить буст

#### Вариант 1: Добавить в существующий хелпер

Откройте `frontend/src/utils/gamificationHelper.ts`:

```typescript
export async function addXPForPost(postId: string, options: {
  hasPhoto?: boolean;
  hasMarker?: boolean;
  hasVideo?: boolean;  // ← НОВЫЙ ПАРАМЕТР
  userId?: string;
}): Promise<void> {
  // ... существующий код
  
  // НОВЫЙ БУСТ
  if (options.hasVideo) {
    await gamificationFacade.addXP({
      userId: options.userId!,
      source: 'post_with_video',
      amount: 40,  // Буст за видео
      contentId: postId,
      contentType: 'post',
      metadata: {
        hasVideo: true,
      },
    });
  }
}
```

#### Вариант 2: Создать отдельный источник XP

1. Добавить в `xpSources.ts`:
```typescript
post_with_video: {
  id: 'post_with_video',
  name: 'Пост с видео',
  description: 'Бонус за пост с видео',
  baseAmount: 40,
  category: 'content',
  requiresModeration: true,
},
```

2. Добавить тип в `gamification.ts`:
```typescript
export type XPSource = 
  | 'post_created'
  | 'post_with_video'  // ← ДОБАВИТЬ
  // ...
```

3. Использовать в хелпере (как в варианте 1)

---

## 🏆 Добавление новых достижений

### Шаг 1: Добавить в useAchievements

Откройте `frontend/src/hooks/useAchievements.ts`:

```typescript
const ALL_ACHIEVEMENTS: Achievement[] = [
  // ... существующие достижения
  
  // НОВОЕ ДОСТИЖЕНИЕ
  {
    id: 'new_achievement',
    title: 'Новое достижение',
    description: 'Описание достижения',
    icon: 'star',  // Имя иконки из lucide-react
    category: 'posts',  // 'places' | 'posts' | 'quality' | 'activity' | 'special'
    rarity: 'rare',  // 'common' | 'rare' | 'epic' | 'legendary'
    progress: { current: 0, target: 10 },  // Прогресс
    unlocked: false,
    xpReward: 150,  // XP за разблокировку
  },
];
```

### Шаг 2: Добавить логику проверки

В том же файле, в `useEffect` где обновляются достижения:

```typescript
useEffect(() => {
  const updatedAchievements = ALL_ACHIEVEMENTS.map(achievement => {
    // ... существующая логика
    
    // НОВАЯ ЛОГИКА
    if (achievement.id === 'new_achievement') {
      const progress = calculateNewAchievementProgress(); // Ваша функция
      return {
        ...achievement,
        progress: { current: progress, target: 10 },
        unlocked: progress >= 10,
      };
    }
    
    return achievement;
  });
  
  setAchievements(updatedAchievements);
}, [dependencies]);
```

### Шаг 3: Добавить в Backend (опционально)

Если нужно хранить в БД, добавьте в `backend/src/controllers/gamificationController.js`:

```javascript
// В функции getAchievements или отдельной функции
const newAchievement = await pool.query(
  'SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
  [userId, 'new_achievement']
);
```

---

## 📅 Добавление новых ежедневных целей

### Шаг 1: Добавить шаблон цели

Откройте `frontend/src/utils/dailyGoalGenerator.ts`:

```typescript
const GOAL_TEMPLATES: GoalTemplate[] = [
  // ... существующие шаблоны
  
  // НОВЫЙ ШАБЛОН
  {
    type: 'new_action',
    title: 'Новое действие',
    description: 'Выполните {target} новых действий',
    icon: '🎯',
    easy: { target: 1, xp: 30 },
    medium: { target: 3, xp: 50 },
    hard: { target: 5, xp: 75 },
  },
];
```

### Шаг 2: Добавить тип цели

Откройте `frontend/src/types/gamification.ts`:

```typescript
export type GoalType = 
  | 'create_posts'
  | 'create_markers'
  | 'new_action'  // ← ДОБАВИТЬ
  // ...
```

### Шаг 3: Добавить обновление прогресса

В `frontend/src/utils/dailyGoalGenerator.ts`:

```typescript
export function updateGoalProgress(
  goals: DailyGoal[],
  type: GoalType,
  amount: number = 1
): DailyGoal[] {
  return goals.map(goal => {
    if (goal.type === type && !goal.completed) {
      // ... существующая логика
    }
    
    // НОВАЯ ЛОГИКА
    if (goal.type === 'new_action' && !goal.completed) {
      const newCurrent = Math.min(goal.current + amount, goal.target);
      return {
        ...goal,
        current: newCurrent,
        completed: newCurrent >= goal.target,
      };
    }
    
    return goal;
  });
}
```

### Шаг 4: Вызывать обновление при действии

В вашем сервисе или компоненте:

```typescript
import { useGamification } from '../contexts/GamificationContext';
import { updateGoalProgress } from '../utils/dailyGoalGenerator';

const { dailyGoals, setDailyGoals } = useGamification();

// При выполнении действия
const updatedGoals = updateGoalProgress(dailyGoals, 'new_action', 1);
setDailyGoals(updatedGoals);
```

---

## 👑 Добавление новых рангов

### Шаг 1: Добавить ранг в типы

Откройте `frontend/src/types/gamification.ts`:

```typescript
export type UserRank = 
  | 'novice' 
  | 'explorer' 
  | 'traveler' 
  | 'legend' 
  | 'geoblogger'
  | 'new_rank';  // ← ДОБАВИТЬ
```

### Шаг 2: Обновить функцию определения ранга

Откройте `frontend/src/utils/xpCalculator.ts`:

```typescript
export function getRankByLevel(level: number): UserRank {
  if (level >= 100) return 'new_rank';  // ← НОВЫЙ РАНГ
  if (level >= 50) return 'geoblogger';
  if (level >= 31) return 'legend';
  if (level >= 16) return 'traveler';
  if (level >= 6) return 'explorer';
  return 'novice';
}
```

### Шаг 3: Добавить информацию о ранге

В том же файле:

```typescript
export function getRankInfo(rank: UserRank): RankInfo {
  const ranks: Record<UserRank, RankInfo> = {
    // ... существующие ранги
    
    new_rank: {
      name: 'Новый ранг',
      emoji: '🌟',
      description: 'Описание нового ранга',
      privileges: [
        'Все возможности ГеоБлоггера',
        'Новая привилегия 1',
        'Новая привилегия 2',
      ],
      levelRange: [100, Infinity],
    },
  };
  
  return ranks[rank];
}
```

### Шаг 4: Обновить Backend

В `backend/src/utils/xpCalculator.js`:

```javascript
function calculateLevelFromTotalXP(totalXP) {
  // ... существующий код
  
  // Определяем ранг
  let rank = 'novice';
  if (level >= 100) rank = 'new_rank';  // ← ДОБАВИТЬ
  else if (level >= 50) rank = 'geoblogger';
  // ...
}
```

---

## 🔌 Интеграция в новые компоненты

### Пример: Добавить отображение уровня

```typescript
import { useGamification } from '../contexts/GamificationContext';
import LevelCard from '../components/Gamification/LevelCard';

function MyComponent() {
  const { userLevel, loading } = useGamification();
  
  return (
    <div>
      {loading ? 'Загрузка...' : <LevelCard />}
    </div>
  );
}
```

### Пример: Добавить начисление XP

```typescript
import { useGamification } from '../contexts/GamificationContext';

function MyComponent() {
  const { addXP } = useGamification();
  
  const handleAction = async () => {
    // Выполняем действие
    const result = await doSomething();
    
    // Начисляем XP
    await addXP({
      userId: user.id,
      source: 'my_action',
      amount: 50,
      contentId: result.id,
      contentType: 'action',
    });
  };
  
  return <button onClick={handleAction}>Выполнить</button>;
}
```

---

## 🔧 Backend API

### Эндпоинты

Все эндпоинты находятся в `backend/src/routes/gamificationRoutes.js`:

- `GET /api/gamification/level/:userId?` - получить уровень
- `POST /api/gamification/xp` - добавить XP
- `GET /api/gamification/daily-goals` - получить цели
- `POST /api/gamification/goals/:goalId/complete` - выполнить цель
- `POST /api/gamification/daily-reward/claim` - получить награду
- `GET /api/gamification/achievements` - получить достижения
- `GET /api/gamification/stats` - получить статистику

### Добавление нового эндпоинта

1. Добавить функцию в `backend/src/controllers/gamificationController.js`:

```javascript
export const myNewEndpoint = async (req, res) => {
  try {
    const userId = req.user?.id;
    // ... ваша логика
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('myNewEndpoint error:', error);
    res.status(500).json({ error: 'Failed' });
  }
};
```

2. Добавить роут в `backend/src/routes/gamificationRoutes.js`:

```javascript
router.get('/my-endpoint', myNewEndpoint);
```

---

## 🐛 Отладка и тестирование

### Проверка начисления XP

1. Откройте консоль браузера (F12)
2. Создайте пост или метку
3. Проверьте логи:
   - `GamificationHelper: ...` - хелпер вызван
   - `GamificationFacade.addXP: ...` - фасад обрабатывает
   - `POST /api/gamification/xp` - запрос отправлен

### Проверка уровня

```typescript
import { useGamification } from '../contexts/GamificationContext';

function DebugComponent() {
  const { userLevel, loading } = useGamification();
  
  console.log('User Level:', userLevel);
  console.log('Loading:', loading);
  
  return <div>Level: {userLevel?.level}</div>;
}
```

### Проверка целей

```typescript
import { useDailyGoals } from '../hooks/useDailyGoals';

function DebugGoals() {
  const { dailyGoals, progress, allCompleted } = useDailyGoals();
  
  console.log('Goals:', dailyGoals);
  console.log('Progress:', progress);
  console.log('All Completed:', allCompleted);
  
  return <div>Goals: {dailyGoals.length}</div>;
}
```

### Тестирование Backend

```bash
# Проверить уровень пользователя
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/api/gamification/level/USER_ID

# Добавить XP
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":"post_created","amount":50,"contentId":"123"}' \
  http://localhost:3002/api/gamification/xp
```

---

## ⚠️ Важные замечания

### Защита от накруток

1. **Всегда используйте `gamificationFacade`** - он проверяет уникальность
2. **Проверяйте модерацию** - XP начисляется только после одобрения
3. **Используйте лимиты** - настройте `dailyLimit` в `xpSources.ts`
4. **Маршруты исключены** - не добавляйте XP за создание маршрутов

### Производительность

1. **Асинхронное начисление** - не блокируйте основной поток
2. **Ленивая загрузка** - используйте `import()` для хелперов
3. **Кэширование** - уровень пользователя кэшируется в Context

### Ошибки

1. **Не прерывайте выполнение** - если геймификация не работает, приложение должно продолжать работать
2. **Логируйте ошибки** - используйте `console.error` для отладки
3. **Обрабатывайте исключения** - всегда используйте `try/catch`

---

## 📝 Чеклист для добавления новой функции

- [ ] Добавить тип в `types/gamification.ts`
- [ ] Добавить конфигурацию в `config/xpSources.ts` (если нужно)
- [ ] Создать хелпер в `utils/gamificationHelper.ts` (если нужно)
- [ ] Интегрировать в сервис (postsService, markerService и т.д.)
- [ ] Обновить Backend контроллер (если нужно)
- [ ] Обновить Backend роуты (если нужно)
- [ ] Протестировать начисление XP
- [ ] Проверить защиту от накруток
- [ ] Обновить документацию

---

## 🎯 Примеры использования

### Пример 1: Добавить XP за просмотр поста

```typescript
// В InteractivePostView.tsx
import { useGamification } from '../contexts/GamificationContext';

function InteractivePostView({ postId }) {
  const { addXP } = useGamification();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.id) {
      addXP({
        userId: user.id,
        source: 'post_viewed',
        amount: 2,
        contentId: postId,
        contentType: 'post',
      });
    }
  }, [postId, user?.id]);
  
  // ... остальной код
}
```

### Пример 2: Добавить буст за время суток

```typescript
// В gamificationHelper.ts
export async function addXPForPost(postId: string, options: {
  userId: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}) {
  // Базовый XP
  await gamificationFacade.addXP({
    userId: options.userId,
    source: 'post_created',
    amount: 50,
    contentId: postId,
  });
  
  // Буст за утро
  if (options.timeOfDay === 'morning') {
    await gamificationFacade.addXP({
      userId: options.userId,
      source: 'morning_boost',
      amount: 10,
      contentId: postId,
    });
  }
}
```

---

## 📚 Дополнительные ресурсы

- `frontend/docs/GAMIFICATION_PLAN.md` - общий план системы
- `frontend/docs/GAMIFICATION_IMPLEMENTATION.md` - описание реализации
- `backend/GAMIFICATION_API_README.md` - документация API
- `backend/create_gamification_tables.sql` - SQL схема

---

**Готово! Теперь вы знаете, как работать с системой геймификации и добавлять новые функции.** 🚀

