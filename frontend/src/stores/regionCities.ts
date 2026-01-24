export interface regioncity {
  regionid: string;
  cityname: string;
  coordinates: [number, number]; // [latitude, longitude]
  zoom: number; // рекомендуемый зум для отображения города
}

export const region_cities: regioncity[] = [
  { regionid: 'altai_krai', cityname: 'барнаул', coordinates: [53.3606, 83.7636], zoom: 12 },
  { regionid: 'amur_oblast', cityname: 'благовещенск', coordinates: [50.2901, 127.5272], zoom: 12 },
  { regionid: 'arkhangelsk_oblast', cityname: 'архангельск', coordinates: [64.5393, 40.5187], zoom: 12 },
  { regionid: 'astrakhan_oblast', cityname: 'астрахань', coordinates: [46.3497, 48.0408], zoom: 12 },
  { regionid: 'bashkortostan', cityname: 'уфа', coordinates: [54.7431, 55.9678], zoom: 12 },
  { regionid: 'belgorod_oblast', cityname: 'белгород', coordinates: [50.5950, 36.5874], zoom: 12 },
  { regionid: 'bryansk_oblast', cityname: 'брянск', coordinates: [53.2434, 34.3654], zoom: 12 },
  { regionid: 'buryatia', cityname: 'улан-удэ', coordinates: [51.8272, 107.6063], zoom: 12 },
  { regionid: 'vladimir_oblast', cityname: 'владимир', coordinates: [56.1290, 40.4066], zoom: 12 },
  { regionid: 'suzdal', cityname: 'суздаль', coordinates: [56.4164, 40.4235], zoom: 13 },
  { regionid: 'volgograd_oblast', cityname: 'волгоград', coordinates: [48.7194, 44.5018], zoom: 12 },
  { regionid: 'vologda_oblast', cityname: 'вологда', coordinates: [59.2205, 39.8915], zoom: 12 },
  { regionid: 'voronezh_oblast', cityname: 'воронеж', coordinates: [51.6720, 39.1843], zoom: 12 },
  { regionid: 'dagestan', cityname: 'махачкала', coordinates: [42.9849, 47.5047], zoom: 12 },
  { regionid: 'jewish_ao', cityname: 'биробиджан', coordinates: [48.7947, 132.9218], zoom: 12 },
  { regionid: 'zabaykalsky_krai', cityname: 'чита', coordinates: [52.0340, 113.4990], zoom: 12 },
  { regionid: 'ivanovo_oblast', cityname: 'иваново', coordinates: [57.0004, 40.9739], zoom: 12 },
  { regionid: 'ingushetia', cityname: 'магас', coordinates: [43.1667, 44.8000], zoom: 12 },
  { regionid: 'irkutsk_oblast', cityname: 'иркутск', coordinates: [52.2864, 104.2807], zoom: 12 },
  { regionid: 'kabardino_balkaria', cityname: 'нальчик', coordinates: [43.4853, 43.6071], zoom: 12 },
  { regionid: 'kaliningrad_oblast', cityname: 'калининград', coordinates: [54.7104, 20.4522], zoom: 12 },
  { regionid: 'kalmykia', cityname: 'элиста', coordinates: [46.3078, 44.2558], zoom: 12 },
  { regionid: 'kaluga_oblast', cityname: 'калуга', coordinates: [54.5138, 36.2612], zoom: 12 },
  { regionid: 'kamchatka_krai', cityname: 'петропавловск-камчатский', coordinates: [53.0374, 158.6559], zoom: 12 },
  { regionid: 'karachay_cherkessia', cityname: 'черкесск', coordinates: [44.2269, 42.0578], zoom: 12 },
  { regionid: 'karelia', cityname: 'петрозаводск', coordinates: [61.7850, 34.3469], zoom: 12 },
  { regionid: 'kemerovo_oblast', cityname: 'кемерово', coordinates: [55.3543, 86.0883], zoom: 12 },
  { regionid: 'kirov_oblast', cityname: 'киров', coordinates: [58.6036, 49.6680], zoom: 12 },
  { regionid: 'komi', cityname: 'сыктывкар', coordinates: [61.6698, 50.8351], zoom: 12 },
  { regionid: 'kostroma_oblast', cityname: 'кострома', coordinates: [57.7678, 40.9269], zoom: 12 },
  { regionid: 'krasnodar_krai', cityname: 'краснодар', coordinates: [45.0355, 38.9753], zoom: 12 },
  { regionid: 'krasnoyarsk_krai', cityname: 'красноярск', coordinates: [56.0184, 92.8672], zoom: 12 },
  { regionid: 'crimea', cityname: 'симферополь', coordinates: [44.9521, 34.1024], zoom: 12 },
  { regionid: 'kurgan_oblast', cityname: 'курган', coordinates: [55.4422, 65.3148], zoom: 12 },
  { regionid: 'kursk_oblast', cityname: 'курск', coordinates: [51.7373, 36.1873], zoom: 12 },
  { regionid: 'leningrad_oblast', cityname: 'гатчина', coordinates: [59.5653, 30.1283], zoom: 11 },
  { regionid: 'lipetsk_oblast', cityname: 'липецк', coordinates: [52.6088, 39.5992], zoom: 12 },
  { regionid: 'magadan_oblast', cityname: 'магадан', coordinates: [59.5688, 150.8085], zoom: 12 },
  { regionid: 'mari_el', cityname: 'йошкар-ола', coordinates: [56.6344, 47.9047], zoom: 12 },
  { regionid: 'mordovia', cityname: 'саранск', coordinates: [54.1874, 45.1839], zoom: 12 },
  { regionid: 'moscow_city', cityname: 'москва', coordinates: [55.7558, 37.6176], zoom: 11 },
  { regionid: 'moscow_oblast', cityname: 'москва', coordinates: [55.7558, 37.6176], zoom: 10 },
  { regionid: 'murmansk_oblast', cityname: 'мурманск', coordinates: [68.9792, 33.0925], zoom: 12 },
  { regionid: 'nenets_ao', cityname: 'нарьян-мар', coordinates: [67.6380, 53.0069], zoom: 12 },
  { regionid: 'nizhny_novgorod_oblast', cityname: 'нижний новгород', coordinates: [56.2965, 43.9361], zoom: 12 },
  { regionid: 'novgorod_oblast', cityname: 'великий новгород', coordinates: [58.5223, 31.2691], zoom: 12 },
  { regionid: 'novosibirsk_oblast', cityname: 'новосибирск', coordinates: [55.0084, 82.9357], zoom: 12 },
  { regionid: 'omsk_oblast', cityname: 'омск', coordinates: [54.9885, 73.3242], zoom: 12 },
  { regionid: 'orenburg_oblast', cityname: 'оренбург', coordinates: [51.7682, 55.0970], zoom: 12 },
  { regionid: 'oryol_oblast', cityname: 'орёл', coordinates: [52.9703, 36.0636], zoom: 12 },
  { regionid: 'penza_oblast', cityname: 'пенза', coordinates: [53.2001, 45.0045], zoom: 12 },
  { regionid: 'perm_krai', cityname: 'пермь', coordinates: [58.0105, 56.2502], zoom: 12 },
  { regionid: 'primorsky_krai', cityname: 'владивосток', coordinates: [43.1155, 131.8855], zoom: 12 },
  { regionid: 'pskov_oblast', cityname: 'псков', coordinates: [57.8136, 28.3496], zoom: 12 },
  { regionid: 'rostov_oblast', cityname: 'ростов-на-дону', coordinates: [47.2357, 39.7015], zoom: 12 },
  { regionid: 'ryazan_oblast', cityname: 'рязань', coordinates: [54.6269, 39.6916], zoom: 12 },
  { regionid: 'samara_oblast', cityname: 'самара', coordinates: [53.2001, 50.15], zoom: 12 },
  { regionid: 'saratov_oblast', cityname: 'саратов', coordinates: [51.5336, 46.0342], zoom: 12 },
  { regionid: 'sakhalin_oblast', cityname: 'южно-сахалинск', coordinates: [46.9591, 142.7380], zoom: 12 },
  { regionid: 'sverdlovsk_oblast', cityname: 'екатеринбург', coordinates: [56.8431, 60.6454], zoom: 12 },
  { regionid: 'sevastopol', cityname: 'севастополь', coordinates: [44.6166, 33.5254], zoom: 12 },
  { regionid: 'north_ossetia', cityname: 'владикавказ', coordinates: [43.0241, 44.6819], zoom: 12 },
  { regionid: 'smolensk_oblast', cityname: 'смоленск', coordinates: [54.7826, 32.0453], zoom: 12 },
  { regionid: 'stavropol_krai', cityname: 'ставрополь', coordinates: [45.0445, 41.9690], zoom: 12 },
  { regionid: 'tambov_oblast', cityname: 'тамбов', coordinates: [52.7212, 41.4522], zoom: 12 },
  { regionid: 'tatarstan', cityname: 'казань', coordinates: [55.8304, 49.0661], zoom: 12 },
  { regionid: 'tver_oblast', cityname: 'тверь', coordinates: [56.8584, 35.9006], zoom: 12 },
  { regionid: 'tomsk_oblast', cityname: 'томск', coordinates: [56.4846, 84.9476], zoom: 12 },
  { regionid: 'tula_oblast', cityname: 'тула', coordinates: [54.1931, 37.6173], zoom: 12 },
  { regionid: 'tuva', cityname: 'кызыл', coordinates: [51.7194, 94.4378], zoom: 12 },
  { regionid: 'tyumen_oblast', cityname: 'тюмень', coordinates: [57.1522, 65.5272], zoom: 12 },
  { regionid: 'udmurtia', cityname: 'ижевск', coordinates: [56.8528, 53.2115], zoom: 12 },
  { regionid: 'ulyanovsk_oblast', cityname: 'ульяновск', coordinates: [54.3142, 48.4031], zoom: 12 },
  { regionid: 'khabarovsk_krai', cityname: 'хабаровск', coordinates: [48.4802, 135.0719], zoom: 12 },
  { regionid: 'khakassia', cityname: 'абакан', coordinates: [53.7212, 91.4426], zoom: 12 },
  { regionid: 'khanty_mansi_ao', cityname: 'ханты-мансийск', coordinates: [61.0042, 69.0019], zoom: 12 },
  { regionid: 'chelyabinsk_oblast', cityname: 'челябинск', coordinates: [55.1644, 61.4368], zoom: 12 },
  { regionid: 'chechnya', cityname: 'грозный', coordinates: [43.3119, 45.6885], zoom: 12 },
  { regionid: 'chuvashia', cityname: 'чебоксары', coordinates: [56.1439, 47.2489], zoom: 12 },
  { regionid: 'chukotka_ao', cityname: 'анадырь', coordinates: [64.7333, 177.5167], zoom: 12 },
  { regionid: 'yakutia', cityname: 'якутск', coordinates: [62.0274, 129.7319], zoom: 12 },
  { regionid: 'yamal_ao', cityname: 'салехард', coordinates: [66.5297, 66.6147], zoom: 12 },
  { regionid: 'yaroslavl_oblast', cityname: 'ярославль', coordinates: [57.6261, 39.8845], zoom: 12 },
  { regionid: 'spb', cityname: 'санкт-петербург', coordinates: [59.9343, 30.3351], zoom: 11 },
  { regionid: 'adygea', cityname: 'майкоп', coordinates: [44.6078, 40.1058], zoom: 12 },
  { regionid: 'altai_republic', cityname: 'горно-алтайск', coordinates: [51.9581, 85.9603], zoom: 12 },
];

/**
 * получить информацию о главном городе региона
 */
export function getregioncity(regionid: string): regioncity | null {
  return region_cities.find(rc => rc.regionid === regionid) || null;
}

/**
 * получить координаты главного города региона
 */
export function getregioncitycoordinates(regionid: string): [number, number] | null {
  const city = getregioncity(regionid);
  return city ? city.coordinates : null;
}

/**
 * получить рекомендуемый зум для региона
 */
export function getregionzoom(regionid: string): number {
  const city = getregioncity(regionid);
  return city ? city.zoom : 12; // дефолтный зум
}

