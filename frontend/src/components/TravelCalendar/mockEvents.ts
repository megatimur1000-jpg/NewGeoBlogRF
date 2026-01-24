export interface MockEvent {
  id: number;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD (начальная дата)
  endDate?: string; // YYYY-MM-DD (конечная дата для многодневных событий)
  categoryId: string;
  hashtags: string[];
  location?: string;
  // Координаты для отображения на карте
  latitude: number;
  longitude: number;
}

export const mockEvents: MockEvent[] = [
  {
    id: 1,
    title: 'Авиабилеты в Париж',
    description: 'Специальные цены на авиабилеты в Париж. Скидка до 30% при бронировании до конца месяца.',
    date: '2024-07-05',
    categoryId: 'flights',
    hashtags: ['париж', 'авиабилеты', 'скидка'],
    latitude: 55.7558,
    longitude: 37.6173 // Москва, центр
  },
  {
    id: 2,
    title: 'Отель "Маритим"',
    description: 'Роскошный отель в центре Сочи с видом на море. Завтрак включен.',
    date: '2024-07-05',
    categoryId: 'hotels',
    hashtags: ['сочи', 'отель', 'море'],
    latitude: 43.6028,
    longitude: 39.7342 // Сочи
  },
  {
    id: 3,
    title: 'Экскурсия в Эрмитаж',
    description: 'Увлекательная экскурсия по залам Эрмитажа с профессиональным гидом.',
    date: '2024-07-12',
    categoryId: 'tours',
    hashtags: ['спб', 'эрмитаж', 'культура'],
    latitude: 59.9398,
    longitude: 30.3146 // Санкт-Петербург, Эрмитаж
  },
  {
    id: 4,
    title: 'Ресторан "Белуга"',
    description: 'Изысканная русская кухня в самом сердце Москвы. Столик на террасе.',
    date: '2024-07-12',
    categoryId: 'restaurants',
    hashtags: ['москва', 'ресторан', 'терраса'],
    latitude: 55.7558,
    longitude: 37.6173 // Москва, центр
  },
  {
    id: 5,
    title: 'Трансфер в аэропорт',
    description: 'Комфортный трансфер на премиум автомобиле. Встреча с табличкой.',
    date: '2024-07-15',
    categoryId: 'transport',
    hashtags: ['трансфер', 'аэропорт', 'комфорт'],
    latitude: 55.9726,
    longitude: 37.4146 // Москва, Шереметьево
  },
  {
    id: 6,
    title: 'Красная площадь',
    description: 'Фотосессия на Красной площади с профессиональным фотографом.',
    date: '2024-07-18',
    categoryId: 'attractions',
    hashtags: ['москва', 'красная площадь', 'фото'],
    latitude: 55.7539,
    longitude: 37.6208 // Москва, Красная площадь
  },
  {
    id: 7,
    title: 'Круиз по Неве',
    description: 'Романтический круиз по Неве с ужином и живой музыкой.',
    date: '2024-07-20',
    categoryId: 'tours',
    hashtags: ['спб', 'нева', 'круиз'],
    latitude: 59.9343,
    longitude: 30.3076 // Санкт-Петербург, набережная Невы
  },
  {
    id: 8,
    title: 'Билеты в Большой',
    description: 'Премьера балета "Лебединое озеро" в Большом театре.',
    date: '2024-07-22',
    categoryId: 'attractions',
    hashtags: ['москва', 'балет', 'большой театр'],
    latitude: 55.7596,
    longitude: 37.6194 // Москва, Большой театр
  },
  {
    id: 9,
    title: 'Отель "Астория"',
    description: 'Исторический отель в центре Санкт-Петербурга. Номер класса люкс.',
    date: '2024-07-25',
    categoryId: 'hotels',
    hashtags: ['спб', 'астория', 'люкс'],
    latitude: 59.9308,
    longitude: 30.3156 // Санкт-Петербург, отель Астория
  },
  {
    id: 10,
    title: 'Кафе "Пушкин"',
    description: 'Знаменитое кафе с авторской кухней и уютной атмосферой.',
    date: '2024-07-25',
    categoryId: 'restaurants',
    hashtags: ['москва', 'пушкин', 'авторская кухня'],
    latitude: 55.7558,
    longitude: 37.6173 // Москва, центр
  },
  {
    id: 11,
    title: 'Аренда авто',
    description: 'Прокат автомобилей премиум класса для путешествий по России.',
    date: '2024-07-28',
    categoryId: 'transport',
    hashtags: ['аренда', 'авто', 'путешествия'],
    latitude: 55.7558,
    longitude: 37.6173 // Москва, центр
  },
  {
    id: 12,
    title: 'Тур в Казань',
    description: 'Двухдневный тур в Казань с посещением Кремля и Кул Шариф.',
    date: '2024-07-30',
    categoryId: 'tours',
    hashtags: ['казань', 'кремль', 'тур'],
    latitude: 55.7986,
    longitude: 49.1064 // Казань, Кремль
  }
];
