module.exports = {
  // Начинаем с популярных для россиян направлений
  START_COUNTRIES: [
    'Россия',
    'Турция',       // №1 по турпотоку из РФ
    'Таиланд',      // №2 популярности  
    'Египет',       // №3 направления
    'ОАЭ',          // №4 по посещаемости
    'Кипр',         // №5 популярные курорты
    'Греция',       // №6 культурный туризм
    'Италия',       // №7 архитектура и еда
    'Испания',      // №8 пляжи и города
    'Грузия',       // №9 ближайшее зарубежье
    'Казахстан'     // №10 СНГ направление
  ],

  countries: {
    turkey: {
      name: 'Турция',
      cities: [
        { key: 'istanbul', name: 'Стамбул', priority: 1 },
        { key: 'ankara', name: 'Анкара', priority: 2 },
        { key: 'antalya', name: 'Анталья', priority: 1 },
        { key: 'izmir', name: 'Измир', priority: 2 },
        { key: 'bursa', name: 'Бурса', priority: 2 },
        { key: 'adana', name: 'Адана', priority: 3 },
        { key: 'konya', name: 'Конья', priority: 3 },
        { key: 'gaziantep', name: 'Газиантеп', priority: 3 },
        { key: 'mersin', name: 'Мерсин', priority: 3 },
        { key: 'diyarbakir', name: 'Диярбакыр', priority: 3 }
      ]
    },
    
    thailand: {
      name: 'Таиланд',
      cities: [
        { key: 'bangkok', name: 'Бангкок', priority: 1 },
        { key: 'chiang_mai', name: 'Чиангмай', priority: 1 },
        { key: 'phuket', name: 'Пхукет', priority: 1 },
        { key: 'pattaya', name: 'Паттайя', priority: 2 },
        { key: 'chiang_rai', name: 'Чианграй', priority: 2 },
        { key: 'krabi', name: 'Краби', priority: 2 },
        { key: 'koh_samui', name: 'Самуи', priority: 2 },
        { key: 'hua_hin', name: 'Хуахин', priority: 3 },
        { key: 'sukhothai', name: 'Сукотай', priority: 3 },
        { key: 'ayutthaya', name: 'Аюттхая', priority: 3 }
      ]
    },
    
    egypt: {
      name: 'Египет',
      cities: [
        { key: 'cairo', name: 'Каир', priority: 1 },
        { key: 'alexandria', name: 'Александрия', priority: 1 },
        { key: 'luxor', name: 'Луксор', priority: 1 },
        { key: 'aswan', name: 'Асуан', priority: 2 },
        { key: 'hurghada', name: 'Хургада', priority: 1 },
        { key: 'sharm_el_sheikh', name: 'Шарм-эль-Шейх', priority: 1 },
        { key: 'dahab', name: 'Дахаб', priority: 2 },
        { key: 'marsa_alam', name: 'Марса-Алам', priority: 2 },
        { key: 'port_said', name: 'Порт-Саид', priority: 3 },
        { key: 'suez', name: 'Суэц', priority: 3 }
      ]
    },
    
    uae: {
      name: 'ОАЭ',
      cities: [
        { key: 'dubai', name: 'Дубай', priority: 1 },
        { key: 'abu_dhabi', name: 'Абу-Даби', priority: 1 },
        { key: 'sharjah', name: 'Шарджа', priority: 2 },
        { key: 'ajman', name: 'Аджман', priority: 2 },
        { key: 'ras_al_khaimah', name: 'Рас-эль-Хайма', priority: 2 },
        { key: 'fujairah', name: 'Фуджейра', priority: 2 },
        { key: 'umm_al_quwain', name: 'Умм-эль-Кайвайн', priority: 3 }
      ]
    },
    
    cyprus: {
      name: 'Кипр',
      cities: [
        { key: 'nicosia', name: 'Никосия', priority: 1 },
        { key: 'limassol', name: 'Лимассол', priority: 1 },
        { key: 'larnaca', name: 'Ларнака', priority: 1 },
        { key: 'paphos', name: 'Пафос', priority: 1 },
        { key: 'famagusta', name: 'Фамагуста', priority: 2 },
        { key: 'kyrenia', name: 'Кирения', priority: 2 },
        { key: 'protaras', name: 'Протарас', priority: 2 },
        { key: 'ayia_napa', name: 'Айя-Напа', priority: 2 }
      ]
    },
    
    greece: {
      name: 'Греция',
      cities: [
        { key: 'athens', name: 'Афины', priority: 1 },
        { key: 'thessaloniki', name: 'Салоники', priority: 1 },
        { key: 'patras', name: 'Патры', priority: 2 },
        { key: 'heraklion', name: 'Ираклион', priority: 2 },
        { key: 'rhodes', name: 'Родос', priority: 1 },
        { key: 'mykonos', name: 'Миконос', priority: 2 },
        { key: 'santorini', name: 'Санторини', priority: 1 },
        { key: 'corfu', name: 'Корфу', priority: 2 },
        { key: 'chania', name: 'Ханья', priority: 2 },
        { key: 'volos', name: 'Волос', priority: 3 }
      ]
    },
    
    italy: {
      name: 'Италия',
      cities: [
        { key: 'rome', name: 'Рим', priority: 1 },
        { key: 'milan', name: 'Милан', priority: 1 },
        { key: 'naples', name: 'Неаполь', priority: 1 },
        { key: 'venice', name: 'Венеция', priority: 1 },
        { key: 'florence', name: 'Флоренция', priority: 1 },
        { key: 'bologna', name: 'Болонья', priority: 2 },
        { key: 'genoa', name: 'Генуя', priority: 2 },
        { key: 'turin', name: 'Турин', priority: 2 },
        { key: 'palermo', name: 'Палермо', priority: 2 },
        { key: 'catania', name: 'Катания', priority: 2 },
        { key: 'bari', name: 'Бари', priority: 2 },
        { key: 'verona', name: 'Верона', priority: 2 }
      ]
    },
    
    spain: {
      name: 'Испания',
      cities: [
        { key: 'madrid', name: 'Мадрид', priority: 1 },
        { key: 'barcelona', name: 'Барселона', priority: 1 },
        { key: 'valencia', name: 'Валенсия', priority: 1 },
        { key: 'seville', name: 'Севилья', priority: 1 },
        { key: 'zaragoza', name: 'Сарагоса', priority: 2 },
        { key: 'malaga', name: 'Малага', priority: 1 },
        { key: 'murcia', name: 'Мурсия', priority: 2 },
        { key: 'palma', name: 'Пальма', priority: 1 },
        { key: 'las_palmas', name: 'Лас-Пальмас', priority: 2 },
        { key: 'bilbao', name: 'Бильбао', priority: 2 },
        { key: 'alicante', name: 'Аликанте', priority: 2 },
        { key: 'cordoba', name: 'Кордова', priority: 2 }
      ]
    },
    
    georgia: {
      name: 'Грузия',
      cities: [
        { key: 'tbilisi', name: 'Тбилиси', priority: 1 },
        { key: 'batumi', name: 'Батуми', priority: 1 },
        { key: 'kutaisi', name: 'Кутаиси', priority: 2 },
        { key: 'rustavi', name: 'Рустави', priority: 2 },
        { key: 'gori', name: 'Гори', priority: 2 },
        { key: 'zugdidi', name: 'Зугдиди', priority: 3 },
        { key: 'poti', name: 'Поти', priority: 3 },
        { key: 'sokhumi', name: 'Сухуми', priority: 2 },
        { key: 'tskhinvali', name: 'Цхинвали', priority: 3 },
        { key: 'telavi', name: 'Телави', priority: 3 }
      ]
    },
    
    kazakhstan: {
      name: 'Казахстан',
      cities: [
        { key: 'almaty', name: 'Алматы', priority: 1 },
        { key: 'nur_sultan', name: 'Нур-Султан', priority: 1 },
        { key: 'shymkent', name: 'Шымкент', priority: 2 },
        { key: 'aktobe', name: 'Актобе', priority: 2 },
        { key: 'taraz', name: 'Тараз', priority: 2 },
        { key: 'pavlodar', name: 'Павлодар', priority: 2 },
        { key: 'ust_kamenogorsk', name: 'Усть-Каменогорск', priority: 2 },
        { key: 'semey', name: 'Семей', priority: 2 },
        { key: 'atyrau', name: 'Атырау', priority: 2 },
        { key: 'kostanay', name: 'Костанай', priority: 2 },
        { key: 'kyzylorda', name: 'Кызылорда', priority: 3 },
        { key: 'petropavl', name: 'Петропавловск', priority: 2 }
      ]
    }
  }
};
