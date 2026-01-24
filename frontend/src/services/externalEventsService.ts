export interface ExternalEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: {
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  category?: string;
  image_url?: string;
  url?: string;
  source: 'yandex' | 'afisha' | 'timepad' | 'vk' | 'dgis' | 'local';
  attendees_count?: number;
  price?: string;
  organizer?: string;
}

export interface EventSearchParams {
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // в км
  start_date?: string;
  end_date?: string;
  category?: string;
  query?: string;
  limit?: number;
}

class ExternalEventsService {

  // Поиск событий из всех источников
  // УДАЛЕНО: Внешние API больше не используются
  async searchEvents(params: EventSearchParams): Promise<ExternalEvent[]> {
    // Возвращаем пустой массив - внешние события отключены
      return [];
  }

  // УДАЛЕНО: Поиск событий в TimePad
  private async searchTimepadEvents(params: EventSearchParams): Promise<ExternalEvent[]> {
      return [];
  }

  // УДАЛЕНО: Поиск событий ВКонтакте
  private async searchVkEvents(params: EventSearchParams): Promise<ExternalEvent[]> {
      return [];
  }

  // УДАЛЕНО: Поиск мест в 2GIS
  private async searchDgisPlaces(params: EventSearchParams): Promise<ExternalEvent[]> {
      return [];
  }

  // Удаление дубликатов событий
  private deduplicateEvents(events: ExternalEvent[]): ExternalEvent[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.title}_${event.start_date}_${event.location?.address}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Получение категорий событий
  async getEventCategories(): Promise<{ id: string; name: string; icon?: string }[]> {
    return [
      { id: 'music', name: 'Музыка', icon: '🎵' },
      { id: 'sports', name: 'Спорт', icon: '⚽' },
      { id: 'business', name: 'Бизнес', icon: '💼' },
      { id: 'technology', name: 'Технологии', icon: '💻' },
      { id: 'food', name: 'Еда и напитки', icon: '🍽️' },
      { id: 'art', name: 'Искусство', icon: '🎨' },
      { id: 'education', name: 'Образование', icon: '📚' },
      { id: 'travel', name: 'Путешествия', icon: '✈️' },
      { id: 'health', name: 'Здоровье', icon: '🏥' },
      { id: 'family', name: 'Семья', icon: '👨‍👩‍👧‍👦' }
    ];
  }

  // Сохранение события в локальную базу
  async saveEventToLocal(event: ExternalEvent): Promise<boolean> {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
          date: event.start_date,
          end_date: event.end_date,
          location: event.location?.address,
          latitude: event.location?.latitude,
          longitude: event.location?.longitude,
          category: event.category,
          external_id: event.id,
          external_source: event.source,
          external_url: event.url,
          image_url: event.image_url,
          attendees_count: event.attendees_count,
          price: event.price,
          organizer: event.organizer
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const externalEventsService = new ExternalEventsService();
