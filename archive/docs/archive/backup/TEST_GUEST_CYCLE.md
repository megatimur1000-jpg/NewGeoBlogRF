# 🧪 Тестирование цикла "Гость → Пост → Одобрение → Регистрация → XP"

## 📋 Текущая логика работы

1. **Гость создает пост** → сохраняется в `localStorage` (`guestDrafts` + `guestActions`)
2. **Админ одобряет пост** → нужно вручную пометить в `guestActions` как `approved: true`
3. **Гость регистрируется** → `useWelcomeModal` проверяет одобренные действия и начисляет XP

---

## 🚀 Быстрый тест цикла

### Вариант 1: Ручной тест через консоль браузера

#### Шаг 1: Создать пост от гостя

1. Откройте приложение в **режиме инкогнито** (чтобы быть гостем)
2. Откройте консоль браузера (F12)
3. Создайте пост через интерфейс или выполните в консоли:

```javascript
// Импортируем функции
const { recordGuestAction } = await import('/src/services/guestActionsService.ts');
const { saveDraft } = await import('/src/services/guestDrafts.ts');

// Создаем тестовый пост
const postData = {
  title: 'Тестовый пост для проверки цикла',
  body: 'Этот пост создан для проверки ретроактивного начисления XP',
  photo_urls: null,
  marker_id: null
};

// Сохраняем как draft
const draft = saveDraft('post', postData);

// Записываем действие гостя
recordGuestAction({
  actionType: 'post',
  contentId: draft.id,
  contentData: postData,
  approved: false,
  metadata: {
    hasPhoto: false,
    hasMarker: false
  }
});

console.log('✅ Пост гостя создан:', draft.id);
```

#### Шаг 2: Пометить пост как одобренный (для теста)

В консоли браузера выполните:

```javascript
// Получаем все действия гостя
const { getAllGuestActions, markActionAsApproved } = await import('/src/services/guestActionsService.ts');

const actions = getAllGuestActions();
console.log('Действия гостя:', actions);

// Находим наш тестовый пост
const testPost = actions.find(a => a.actionType === 'post' && a.contentData?.title?.includes('Тестовый'));
if (testPost) {
  // Помечаем как одобренный
  markActionAsApproved(testPost.contentId, 'post');
  console.log('✅ Пост помечен как одобренный:', testPost.contentId);
} else {
  console.error('❌ Пост не найден');
}
```

#### Шаг 3: Зарегистрировать гостя

1. Зарегистрируйтесь через интерфейс (или используйте тестовый аккаунт)
2. После регистрации должно появиться модальное окно "Добро пожаловать!" с информацией о начисленном XP

#### Шаг 4: Проверить результат

В консоли браузера:

```javascript
// Проверяем уровень пользователя
const token = localStorage.getItem('token');
const response = await fetch('/api/gamification/level/{userId}', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const levelData = await response.json();
console.log('Уровень пользователя:', levelData);

// Проверяем историю XP
const xpResponse = await fetch('/api/gamification/xp-history', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const xpHistory = await xpResponse.json();
console.log('История XP:', xpHistory);
```

---

### Вариант 2: Автоматизированный скрипт для консоли

Скопируйте и выполните в консоли браузера (в режиме гостя):

```javascript
(async function testGuestCycle() {
  console.log('🧪 Начало теста цикла "Гость → Пост → Регистрация → XP"');
  
  // Импортируем функции
  const { recordGuestAction, markActionAsApproved, getAllGuestActions, getGuestId } = await import('/src/services/guestActionsService.ts');
  const { saveDraft } = await import('/src/services/guestDrafts.ts');
  
  // Шаг 1: Создаем тестовый пост
  console.log('📝 Шаг 1: Создание тестового поста...');
  const postData = {
    title: `Тестовый пост ${Date.now()}`,
    body: 'Автоматически созданный пост для проверки цикла',
    photo_urls: null,
    marker_id: null
  };
  
  const draft = saveDraft('post', postData);
  const guestId = getGuestId();
  
  recordGuestAction({
    actionType: 'post',
    contentId: draft.id,
    contentData: postData,
    approved: false,
    metadata: {
      hasPhoto: false,
      hasMarker: false
    }
  });
  
  console.log('✅ Пост создан:', draft.id);
  console.log('📋 Guest ID:', guestId);
  
  // Шаг 2: Помечаем как одобренный
  console.log('✅ Шаг 2: Помечаем пост как одобренный...');
  markActionAsApproved(draft.id, 'post');
  
  // Проверяем
  const actions = getAllGuestActions(guestId);
  const approvedActions = actions.filter(a => a.approved);
  console.log('✅ Одобренных действий:', approvedActions.length);
  
  // Шаг 3: Инструкции для регистрации
  console.log('');
  console.log('📋 Шаг 3: Теперь зарегистрируйтесь!');
  console.log('После регистрации должно появиться модальное окно с начисленным XP');
  console.log('');
  console.log('Для проверки после регистрации выполните:');
  console.log(`
    const { getApprovedGuestActions } = await import('/src/services/guestActionsService.ts');
    const approved = getApprovedGuestActions('${guestId}');
    console.log('Одобренные действия:', approved);
  `);
  
  return {
    draftId: draft.id,
    guestId: guestId,
    approvedActions: approvedActions.length
  };
})();
```

---

## 🔧 Создание тестового аккаунта и поста в БД

Если нужно создать тестовый пост напрямую в БД для проверки:

### SQL скрипт для создания тестового поста гостя

```sql
-- 1. Создаем тестовый пост от гостя (author_id = NULL)
INSERT INTO posts (
  title, 
  body, 
  author_id, 
  status, 
  created_at, 
  updated_at
) VALUES (
  'Тестовый пост от гостя для проверки цикла',
  'Этот пост создан для проверки ретроактивного начисления XP при регистрации',
  NULL,  -- Гость = NULL
  'pending',  -- На модерации
  NOW(),
  NOW()
) RETURNING id, title, author_id, status;

-- Сохраните ID поста для следующего шага
```

### Создание тестового пользователя

```sql
-- 2. Создаем тестового пользователя
INSERT INTO users (
  email,
  username,
  password_hash,
  role,
  phone,
  is_verified,
  is_active,
  created_at,
  updated_at
) VALUES (
  'test_guest_' || extract(epoch from now())::text || '@test.com',
  'test_guest_' || extract(epoch from now())::text,
  '$2a$10$dummy_hash_for_testing',  -- Пароль: test123
  'registered',
  '+79991234567',
  true,
  true,
  NOW(),
  NOW()
) RETURNING id, email, username;

-- Сохраните ID пользователя
```

### Привязка поста к пользователю (после одобрения)

```sql
-- 3. Одобряем пост и привязываем к пользователю
UPDATE posts 
SET 
  author_id = '{USER_ID}',  -- ID тестового пользователя
  status = 'active',
  moderated_at = NOW(),
  updated_at = NOW()
WHERE id = '{POST_ID}';  -- ID тестового поста

-- 4. Начисляем XP пользователю
INSERT INTO user_levels (user_id, total_xp, current_level, current_level_xp, required_xp, rank)
VALUES ('{USER_ID}', 50, 1, 50, 100, 'novice')
ON CONFLICT (user_id) DO UPDATE
SET 
  total_xp = user_levels.total_xp + 50,
  updated_at = NOW();

-- 5. Записываем в историю XP
INSERT INTO xp_history (user_id, source, amount, content_id, content_type, metadata)
VALUES (
  '{USER_ID}',
  'post_created',
  50,
  '{POST_ID}',
  'posts',
  '{"title": "Тестовый пост", "moderated": true}'::jsonb
);
```

---

## 🎯 Проверка через API

### 1. Создать пост от гостя (без токена)

```bash
curl -X POST http://localhost:3002/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестовый пост от гостя",
    "body": "Проверка цикла гость-регистрация-XP"
  }'
```

Сохраните `id` из ответа.

### 2. Одобрить пост (как админ)

```bash
curl -X POST http://localhost:3002/api/moderation/approve/posts/{POST_ID} \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### 3. Проверить уровень пользователя

```bash
curl http://localhost:3002/api/gamification/level/{USER_ID} \
  -H "Authorization: Bearer {USER_TOKEN}"
```

---

## 📊 Проверка в localStorage

После создания поста гостя проверьте в консоли:

```javascript
// Проверка guestActions
const actions = JSON.parse(localStorage.getItem('geoblog_guest_actions_v1') || '[]');
console.log('Действия гостя:', actions);

// Проверка guestDrafts
const drafts = JSON.parse(localStorage.getItem('geoblog_guest_drafts_v1') || '[]');
console.log('Черновики гостя:', drafts);

// Проверка guestId
const guestData = localStorage.getItem('guest_session_data');
console.log('Guest ID:', guestData ? JSON.parse(guestData).sessionId : 'не найден');
```

---

## ✅ Ожидаемый результат

После выполнения всех шагов:

1. ✅ Пост гостя создан и сохранен в `localStorage`
2. ✅ Пост помечен как одобренный (`approved: true`)
3. ✅ При регистрации появляется модальное окно "Добро пожаловать!"
4. ✅ В модальном окне показано начисленное XP (минимум 50 XP за пост)
5. ✅ Уровень пользователя обновлен
6. ✅ В БД есть запись в `xp_history` и `user_levels`

---

## 🐛 Отладка

### Проблема: Модальное окно не появляется

**Проверьте:**
1. `localStorage` содержит одобренные действия: `getApprovedGuestActions(guestId).length > 0`
2. `localStorage` не содержит флаг `welcome_shown_{userId}`
3. Пользователь зарегистрирован и авторизован

**Решение:**
```javascript
// Очистить флаг показа
localStorage.removeItem('welcome_shown_{userId}');

// Перезагрузить страницу
location.reload();
```

### Проблема: XP не начисляется

**Проверьте:**
1. Функция `addXPForPost` вызывается в `retroactiveGamification.ts`
2. API `/api/gamification/add-xp` доступен и работает
3. В консоли нет ошибок при регистрации

**Решение:**
```javascript
// Вручную вызвать начисление XP
const { applyRetroactiveGamification } = await import('/src/utils/retroactiveGamification.ts');
const guestId = getGuestId();
const userId = 'YOUR_USER_ID';
const result = await applyRetroactiveGamification(guestId, userId);
console.log('Результат:', result);
```

---

## 📝 Быстрая команда для проверки

Выполните в консоли браузера (после регистрации):

```javascript
(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Не авторизован');
    return;
  }
  
  // Получаем данные пользователя
  const userStr = localStorage.getItem('user');
  const user = JSON.parse(userStr);
  
  // Проверяем уровень
  const levelRes = await fetch(`/api/gamification/level/${user.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const level = await levelRes.json();
  
  // Проверяем историю XP
  const xpRes = await fetch(`/api/gamification/xp-history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const xpHistory = await xpRes.json();
  
  console.log('👤 Пользователь:', user.username);
  console.log('📊 Уровень:', level);
  console.log('💰 История XP:', xpHistory);
})();
```

