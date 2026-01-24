import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { region_cities as REGION_CITIES, regioncity as RegionCity } from './regionCities';

// Список всех регионов России (субъекты РФ)
export interface Region {
  id: string;
  name: string;
  type?: string; // 'область', 'край', 'республика' и т.д.
}

// Интерфейс для столицы региона
export interface Capital {
  id: string; // capitalId (уникальный ID вида capital_${regionId})
  name: string; // cityName
  regionId: string;
  regionName: string; // название региона, к которому относится столица
}

// Предопределенный список всех регионов России
export const ALL_REGIONS: Region[] = [
  { id: 'altai_krai', name: 'Алтайский край' },
  { id: 'amur_oblast', name: 'Амурская область' },
  { id: 'arkhangelsk_oblast', name: 'Архангельская область' },
  { id: 'astrakhan_oblast', name: 'Астраханская область' },
  { id: 'bashkortostan', name: 'Республика Башкортостан' },
  { id: 'belgorod_oblast', name: 'Белгородская область' },
  { id: 'bryansk_oblast', name: 'Брянская область' },
  { id: 'buryatia', name: 'Республика Бурятия' },
  { id: 'vladimir_oblast', name: 'Владимирская область' },
  { id: 'suzdal', name: 'Суздаль' },
  { id: 'volgograd_oblast', name: 'Волгоградская область' },
  { id: 'vologda_oblast', name: 'Вологодская область' },
  { id: 'voronezh_oblast', name: 'Воронежская область' },
  { id: 'dagestan', name: 'Республика Дагестан' },
  { id: 'jewish_ao', name: 'Еврейская автономная область' },
  { id: 'zabaykalsky_krai', name: 'Забайкальский край' },
  { id: 'ivanovo_oblast', name: 'Ивановская область' },
  { id: 'ingushetia', name: 'Республика Ингушетия' },
  { id: 'irkutsk_oblast', name: 'Иркутская область' },
  { id: 'kabardino_balkaria', name: 'Кабардино-Балкарская Республика' },
  { id: 'kaliningrad_oblast', name: 'Калининградская область' },
  { id: 'kalmykia', name: 'Республика Калмыкия' },
  { id: 'kaluga_oblast', name: 'Калужская область' },
  { id: 'kamchatka_krai', name: 'Камчатский край' },
  { id: 'karachay_cherkessia', name: 'Карачаево-Черкесская Республика' },
  { id: 'karelia', name: 'Республика Карелия' },
  { id: 'kemerovo_oblast', name: 'Кемеровская область — Кузбасс' },
  { id: 'kirov_oblast', name: 'Кировская область' },
  { id: 'komi', name: 'Республика Коми' },
  { id: 'kostroma_oblast', name: 'Костромская область' },
  { id: 'krasnodar_krai', name: 'Краснодарский край' },
  { id: 'krasnoyarsk_krai', name: 'Красноярский край' },
  { id: 'crimea', name: 'Республика Крым' },
  { id: 'kurgan_oblast', name: 'Курганская область' },
  { id: 'kursk_oblast', name: 'Курская область' },
  { id: 'leningrad_oblast', name: 'Ленинградская область' },
  { id: 'lipetsk_oblast', name: 'Липецкая область' },
  { id: 'magadan_oblast', name: 'Магаданская область' },
  { id: 'mari_el', name: 'Республика Марий Эл' },
  { id: 'mordovia', name: 'Республика Мордовия' },
  { id: 'moscow_city', name: 'Москва' },
  { id: 'moscow_oblast', name: 'Московская область' },
  { id: 'murmansk_oblast', name: 'Мурманская область' },
  { id: 'nenets_ao', name: 'Ненецкий автономный округ' },
  { id: 'nizhny_novgorod_oblast', name: 'Нижегородская область' },
  { id: 'novgorod_oblast', name: 'Новгородская область' },
  { id: 'novosibirsk_oblast', name: 'Новосибирская область' },
  { id: 'omsk_oblast', name: 'Омская область' },
  { id: 'orenburg_oblast', name: 'Оренбургская область' },
  { id: 'oryol_oblast', name: 'Орловская область' },
  { id: 'penza_oblast', name: 'Пензенская область' },
  { id: 'perm_krai', name: 'Пермский край' },
  { id: 'primorsky_krai', name: 'Приморский край' },
  { id: 'pskov_oblast', name: 'Псковская область' },
  { id: 'rostov_oblast', name: 'Ростовская область' },
  { id: 'ryazan_oblast', name: 'Рязанская область' },
  { id: 'samara_oblast', name: 'Самарская область' },
  { id: 'saratov_oblast', name: 'Саратовская область' },
  { id: 'sakhalin_oblast', name: 'Сахалинская область' },
  { id: 'sverdlovsk_oblast', name: 'Свердловская область' },
  { id: 'sevastopol', name: 'Севастополь' },
  { id: 'north_ossetia', name: 'Республика Северная Осетия — Алания' },
  { id: 'smolensk_oblast', name: 'Смоленская область' },
  { id: 'stavropol_krai', name: 'Ставропольский край' },
  { id: 'tambov_oblast', name: 'Тамбовская область' },
  { id: 'tatarstan', name: 'Республика Татарстан' },
  { id: 'tver_oblast', name: 'Тверская область' },
  { id: 'tomsk_oblast', name: 'Томская область' },
  { id: 'tula_oblast', name: 'Тульская область' },
  { id: 'tuva', name: 'Республика Тыва' },
  { id: 'tyumen_oblast', name: 'Тюменская область' },
  { id: 'udmurtia', name: 'Удмуртская Республика' },
  { id: 'ulyanovsk_oblast', name: 'Ульяновская область' },
  { id: 'khabarovsk_krai', name: 'Хабаровский край' },
  { id: 'khakassia', name: 'Республика Хакасия' },
  { id: 'khanty_mansi_ao', name: 'Ханты-Мансийский автономный округ — Югра' },
  { id: 'chelyabinsk_oblast', name: 'Челябинская область' },
  { id: 'chechnya', name: 'Чеченская Республика' },
  { id: 'chuvashia', name: 'Чувашская Республика — Чувашия' },
  { id: 'chukotka_ao', name: 'Чукотский автономный округ' },
  { id: 'yakutia', name: 'Республика Саха (Якутия)' },
  { id: 'yamal_ao', name: 'Ямало-Ненецкий автономный округ' },
  { id: 'yaroslavl_oblast', name: 'Ярославская область' },
  { id: 'spb', name: 'Санкт-Петербург' },
  { id: 'adygea', name: 'Республика Адыгея' },
  { id: 'altai_republic', name: 'Республика Алтай' },
];

// Получаем список всех столиц из REGION_CITIES
export const ALL_CAPITALS: Capital[] = REGION_CITIES.map(rc => {
  const region = ALL_REGIONS.find(r => r.id === rc.regionid);
  return {
    id: `capital_${rc.regionid}`, // Уникальный ID для столицы
    name: rc.cityname,
    regionId: rc.regionid,
    regionName: region?.name || rc.regionid
  };
});

interface RegionsState {
  // Выбранные регионы (максимум 3, включая столицы)
  selectedRegions: string[];
  
  // Выбранные столицы (часть общего лимита в 3)
  selectedCapitals: string[];
  
  // Домашний регион (определяется по геолокации)
  homeRegion: string | null;
  
  // Методы для управления регионами
  setSelectedRegions: (regions: string[]) => void;
  addRegion: (regionId: string) => void;
  removeRegion: (regionId: string) => void;
  setHomeRegion: (regionId: string | null) => void;
  clearSelectedRegions: () => void;
  
  // Методы для управления столицами
  addCapital: (capitalId: string) => void;
  removeCapital: (capitalId: string) => void;
  isCapitalSelected: (capitalId: string) => boolean;
  getSelectedCapitalsWithNames: () => Capital[];
  getCapitalName: (capitalId: string) => string | null;
  
  // Проверка, выбран ли регион
  isRegionSelected: (regionId: string) => boolean;
  
  // Получить все выбранные регионы с именами
  getSelectedRegionsWithNames: () => Region[];
  
  // Получить имя региона по ID
  getRegionName: (regionId: string) => string | null;
  
  // Получить общее количество выбранных элементов (регионы + столицы)
  getTotalSelectedCount: () => number;
  
  // Проверить, можно ли добавить еще элементы
  canAddMore: () => boolean;
}

const MAX_SELECTED_REGIONS = 3;

export const useRegionsStore = create<RegionsState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      selectedRegions: [],
      selectedCapitals: [],
      homeRegion: null,
      
      // Установка выбранных регионов (с проверкой лимита)
      setSelectedRegions: (regions: string[]) => {
        const limitedRegions = regions.slice(0, MAX_SELECTED_REGIONS);
        set({ selectedRegions: limitedRegions });
      },
      
      // Добавление региона (с проверкой общего лимита)
      addRegion: (regionId: string) => {
        const { selectedRegions, selectedCapitals } = get();
        const totalSelected = selectedRegions.length + selectedCapitals.length;
        if (totalSelected >= MAX_SELECTED_REGIONS) {
          return;
        }
        if (!selectedRegions.includes(regionId)) {
          set({ selectedRegions: [...selectedRegions, regionId] });
        }
      },
      
      // Удаление региона
      removeRegion: (regionId: string) => {
        const { selectedRegions } = get();
        set({ selectedRegions: selectedRegions.filter(id => id !== regionId) });
      },
      
      // Добавление столицы (с проверкой общего лимита)
      addCapital: (capitalId: string) => {
        const { selectedRegions, selectedCapitals } = get();
        const totalSelected = selectedRegions.length + selectedCapitals.length;
        if (totalSelected >= MAX_SELECTED_REGIONS) {
          return;
        }
        if (!selectedCapitals.includes(capitalId)) {
          set({ selectedCapitals: [...selectedCapitals, capitalId] });
        }
      },
      
      // Удаление столицы
      removeCapital: (capitalId: string) => {
        const { selectedCapitals } = get();
        set({ selectedCapitals: selectedCapitals.filter(id => id !== capitalId) });
      },
      
      // Проверка, выбран ли столица
      isCapitalSelected: (capitalId: string) => {
        return get().selectedCapitals.includes(capitalId);
      },
      
      // Получить все выбранные столицы с именами
      getSelectedCapitalsWithNames: () => {
        const { selectedCapitals } = get();
        return selectedCapitals
          .map(id => ALL_CAPITALS.find(c => c.id === id))
          .filter((c): c is Capital => c !== undefined);
      },
      
      // Получить имя столицы по ID
      getCapitalName: (capitalId: string) => {
        const capital = ALL_CAPITALS.find(c => c.id === capitalId);
        return capital ? capital.name : null;
      },
      
      // Установка домашнего региона
      setHomeRegion: (regionId: string | null) => {
        set({ homeRegion: regionId });
        // Автоматически добавляем домашний регион в выбранные только если есть место
        // Если пользователь явно удалил его, не добавляем автоматически при превышении лимита
        const { selectedRegions, selectedCapitals } = get();
        if (regionId && !selectedRegions.includes(regionId)) {
          const totalSelected = selectedRegions.length + selectedCapitals.length;
          // Добавляем автоматически только если есть свободное место
          if (totalSelected < MAX_SELECTED_REGIONS) {
            set({ selectedRegions: [regionId, ...selectedRegions] });
          }
          // Если места нет - не добавляем автоматически, пользователь может добавить вручную
        }
      },
      
      // Очистка выбранных регионов
      clearSelectedRegions: () => {
        set({ selectedRegions: [], selectedCapitals: [] });
      },
      
      // Проверка, выбран ли регион
      isRegionSelected: (regionId: string) => {
        return get().selectedRegions.includes(regionId);
      },
      
      // Получить все выбранные регионы с именами
      getSelectedRegionsWithNames: () => {
        const { selectedRegions } = get();
        return selectedRegions
          .map(id => ALL_REGIONS.find(r => r.id === id))
          .filter((r): r is Region => r !== undefined);
      },
      
      // Получить имя региона по ID
      getRegionName: (regionId: string) => {
        const region = ALL_REGIONS.find(r => r.id === regionId);
        return region ? region.name : null;
      },
      
      // Получить общее количество выбранных элементов
      getTotalSelectedCount: () => {
        const { selectedRegions, selectedCapitals } = get();
        return selectedRegions.length + selectedCapitals.length;
      },
      
      // Проверить, можно ли добавить еще элементы
      canAddMore: () => {
        const { selectedRegions, selectedCapitals } = get();
        return selectedRegions.length + selectedCapitals.length < MAX_SELECTED_REGIONS;
      },
    }),
    {
      name: 'regions-storage',
      // Сохраняем selectedRegions, selectedCapitals и homeRegion
      partialize: (state) => ({
        selectedRegions: state.selectedRegions,
        selectedCapitals: state.selectedCapitals,
        homeRegion: state.homeRegion,
      }),
    }
  )
);

// Функция для определения региона по названию (из геолокации)
export function getRegionIdByName(regionName: string | undefined | null): string | null {
  if (!regionName) return null;
  
  // Нормализуем название региона - убираем лишние пробелы и приводим к нижнему регистру
  const normalized = regionName.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Ищем точное совпадение
  const exactMatch = ALL_REGIONS.find(r => 
    r.name.toLowerCase().trim() === normalized
  );
  if (exactMatch) return exactMatch.id;
  
  // Ищем частичное совпадение - проверяем, содержит ли название региона искомую строку
  const partialMatch = ALL_REGIONS.find(r => {
    const regionNameLower = r.name.toLowerCase().trim();
    return normalized.includes(regionNameLower) || regionNameLower.includes(normalized);
  });
  if (partialMatch) return partialMatch.id;
  
  // Дополнительная проверка: ищем по ключевым словам (например, "Владимирская" -> "vladimir_oblast")
  const keywords = normalized.split(' ');
  if (keywords.length > 0) {
    const keywordMatch = ALL_REGIONS.find(r => {
      const regionNameLower = r.name.toLowerCase();
      return keywords.some(keyword => 
        keyword.length > 3 && regionNameLower.includes(keyword)
      );
    });
    if (keywordMatch) return keywordMatch.id;
  }
  
  return null;
}

