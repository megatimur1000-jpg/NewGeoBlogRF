module.exports = {
  attractions: {
    name: 'Достопримечательности',
    overpass_query: `[out:json][timeout:25];
(
  node["tourism"="attraction"]({{bbox}});
  node["historic"]({{bbox}});
  node["tourism"="viewpoint"]({{bbox}});
  node["amenity"="place_of_worship"]({{bbox}});
  node["tourism"="monument"]({{bbox}});
  node["tourism"="artwork"]({{bbox}});
);
out meta;`,
    subcategories: ['памятник', 'архитектура', 'смотровая площадка', 'историческое место']
  },
  
  museums: {
    name: 'Музеи',
    overpass_query: `[out:json][timeout:25];
(
  node["tourism"="museum"]({{bbox}});
  node["amenity"="arts_centre"]({{bbox}});
  node["tourism"="gallery"]({{bbox}});
);
out meta;`,
    subcategories: ['художественный музей', 'исторический музей', 'научный музей', 'галерея']
  },
  
  restaurants: {
    name: 'Рестораны',
    overpass_query: `[out:json][timeout:25];
(
  node["amenity"="restaurant"]({{bbox}});
  node["amenity"="cafe"]({{bbox}});
  node["amenity"="fast_food"]({{bbox}});
  node["amenity"="bar"]({{bbox}});
  node["amenity"="pub"]({{bbox}});
);
out meta;`,
    subcategories: ['ресторан', 'кафе', 'быстрое питание', 'бар']
  },
  
  hotels: {
    name: 'Отели',
    overpass_query: `[out:json][timeout:25];
(
  node["tourism"="hotel"]({{bbox}});
  node["tourism"="hostel"]({{bbox}});
  node["tourism"="guest_house"]({{bbox}});
  node["tourism"="apartment"]({{bbox}});
);
out meta;`,
    subcategories: ['отель', 'хостел', 'гостевой дом', 'гостиница']
  },
  
  parks: {
    name: 'Парки',
    overpass_query: `[out:json][timeout:25];
(
  node["leisure"="park"]({{bbox}});
  node["leisure"="garden"]({{bbox}});
  node["leisure"="recreation_ground"]({{bbox}});
  node["natural"="park"]({{bbox}});
);
out meta;`,
    subcategories: ['городской парк', 'сад', 'лес', 'сквер']
  },

  // Новые категории для расширенного парсинга
  shopping: {
    name: 'Торговля',
    overpass_query: `[out:json][timeout:25];
(
  node["shop"]({{bbox}});
  node["amenity"="marketplace"]({{bbox}});
  node["amenity"="market"]({{bbox}});
);
out meta;`,
    subcategories: ['магазин', 'торговый центр', 'рынок', 'супермаркет']
  },

  transport: {
    name: 'Транспорт',
    overpass_query: `[out:json][timeout:25];
(
  node["amenity"="bus_station"]({{bbox}});
  node["amenity"="taxi"]({{bbox}});
  node["railway"="station"]({{bbox}});
  node["railway"="halt"]({{bbox}});
  node["amenity"="fuel"]({{bbox}});
);
out meta;`,
    subcategories: ['автобусная остановка', 'железнодорожная станция', 'автозаправка', 'такси']
  },

  healthcare: {
    name: 'Здравоохранение',
    overpass_query: `[out:json][timeout:25];
(
  node["amenity"="hospital"]({{bbox}});
  node["amenity"="clinic"]({{bbox}});
  node["amenity"="pharmacy"]({{bbox}});
  node["amenity"="dentist"]({{bbox}});
);
out meta;`,
    subcategories: ['больница', 'клиника', 'аптека', 'стоматология']
  },

  education: {
    name: 'Образование',
    overpass_query: `[out:json][timeout:25];
(
  node["amenity"="school"]({{bbox}});
  node["amenity"="university"]({{bbox}});
  node["amenity"="college"]({{bbox}});
  node["amenity"="kindergarten"]({{bbox}});
);
out meta;`,
    subcategories: ['школа', 'университет', 'колледж', 'детский сад']
  },

  entertainment: {
    name: 'Развлечения',
    overpass_query: `[out:json][timeout:25];
(
  node["amenity"="cinema"]({{bbox}});
  node["amenity"="theatre"]({{bbox}});
  node["leisure"="sports_centre"]({{bbox}});
  node["leisure"="fitness_centre"]({{bbox}});
  node["amenity"="nightclub"]({{bbox}});
);
out meta;`,
    subcategories: ['кинотеатр', 'театр', 'спортивный центр', 'фитнес-клуб']
  },

  services: {
    name: 'Услуги',
    overpass_query: `[out:json][timeout:25];
(
  node["amenity"="bank"]({{bbox}});
  node["amenity"="post_office"]({{bbox}});
  node["amenity"="police"]({{bbox}});
  node["amenity"="fire_station"]({{bbox}});
  node["amenity"="townhall"]({{bbox}});
);
out meta;`,
    subcategories: ['банк', 'почта', 'полиция', 'пожарная часть']
  },

  nature: {
    name: 'Природа',
    overpass_query: `[out:json][timeout:25];
(
  node["natural"="water"]({{bbox}});
  node["natural"="beach"]({{bbox}});
  node["natural"="peak"]({{bbox}});
  node["natural"="cave_entrance"]({{bbox}});
  node["natural"="spring"]({{bbox}});
);
out meta;`,
    subcategories: ['озеро', 'пляж', 'гора', 'пещера', 'источник']
  }
};