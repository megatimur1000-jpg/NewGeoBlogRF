export type PointType = 'poi' | 'address' | 'click';

export interface TitlePoint {
	id?: string;
	name?: string;
	coordinates: [number, number]; // [lat, lon]
	type: PointType;
}

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

function extractCity(name?: string): string | null {
	if (!name) return null;
	// Простейшие эвристики: берём часть после запятой, если похоже на город
	const parts = name.split(',').map(s => s.trim());
	if (parts.length >= 2) {
		const last = parts[parts.length - 1];
		if (last && /[А-ЯЁA-Z][а-яёa-z\-\s]+/.test(last) && last.length <= 30) return last;
	}
	return null;
}

function extractStreet(name?: string): string | null {
	if (!name) return null;
	const streetMatch = name.match(/(ул\.|улица|проспект|пр\.|шоссе|ш\.|наб\.|набережная|площадь|пл\.)\s+[\wА-Яа-яЁё\-\.\s]+/i);
	if (streetMatch) return streetMatch[0].trim();
	// fallback: если есть пробелы и нет города — возьмём первую фразу
	const parts = name.split(',').map(s => s.trim());
	return parts[0] || null;
}

export function classifyPoint(name: string | undefined, id: string | undefined, favoriteIds: Set<string>): PointType {
	if (id && favoriteIds.has(id)) return 'poi';
	if (name && (/ул\.|улица|проспект|шоссе|набережная|площадь|,\s*\d/.test(name))) return 'address';
	return 'click';
}

export function generateNeutralTitles(points: TitlePoint[]): string[] {
	const cities = uniq(points.map(p => extractCity(p.name || '')).filter(Boolean) as string[]);
	const streets = uniq(points.map(p => extractStreet(p.name || '')).filter(Boolean) as string[]);

	if (cities.length === 1) {
		const city = cities[0];
		if (streets.length >= 2) {
			return [
				`Улицами ${city}`,
				`От ${streets[0]} до ${streets[1]}`,
				`Маршрут по ${city}`
			];
		} else {
			return [`По ${city}`, `Прогулка по ${city}`];
		}
	} else if (cities.length === 2) {
		return [`От ${cities[0]} до ${cities[1]}`];
	} else {
		return ['Маршрут без названия'];
	}
}

export function generateTitleSuggestions(points: TitlePoint[]): string[] {
	const hasOnlyPoi = points.length > 0 && points.every(p => p.type === 'poi');
	const hasAnyPoi = points.some(p => p.type === 'poi');
	const hasOnlyRaw = points.length > 0 && points.every(p => p.type !== 'poi');

	if (hasOnlyPoi) {
		// Поэтичные названия на основе первых двух названий
		const names = uniq(points.map(p => p.name || '').filter(Boolean));
		if (names.length >= 2) {
			return [
				`От ${names[0]} к ${names[1]}`,
				`Путь к ${names[1]}`,
				...generateNeutralTitles(points)
			];
		}
		return [...generateNeutralTitles(points)];
	}

	if (hasAnyPoi) {
		const names = uniq(points.map(p => p.name || '').filter(Boolean));
		const base = generateNeutralTitles(points);
		return [
			...(names.length >= 2 ? [`К ${names[1]} по городским улицам`] : []),
			...base
		];
	}

	if (hasOnlyRaw) {
		const base = generateNeutralTitles(points);
		return [
			...base,
			'От А до Б'
		];
	}

	return ['Маршрут'];
}

export function requiresModeration(title: string, isCustomTitle: boolean, points: TitlePoint[]): boolean {
	const isFromApprovedPoiOnly = points.length > 0 && points.every(p => p.type === 'poi');
	if (!isCustomTitle && isFromApprovedPoiOnly) return false;
	return true;
}


