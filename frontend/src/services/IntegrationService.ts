type IntegrationCallback = (data: any) => void;

class IntegrationService {
  private listeners: Map<string, IntegrationCallback[]>;

  constructor() {
    this.listeners = new Map();
    this.setupMessageListener();
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.data.type && this.listeners.has(event.data.type)) {
        this.listeners.get(event.data.type)!.forEach(callback => {
          callback(event.data);
        });
      }
    });
  }

  subscribe(eventType: string, callback: IntegrationCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  emit(eventType: string, data: any) {
    window.postMessage({ type: eventType, ...data }, '*');
  }

  createMapMarker(location: any, eventData: any) {
    this.emit('MAP_CREATE_MARKER', {
      location,
      eventData,
      markerId: `event_${eventData.id}`
    });
  }

  openMapLocation(markerId: string) {
    this.emit('MAP_OPEN_LOCATION', { markerId });
  }

  createEventChat(eventData: any) {
    this.emit('CHAT_CREATE_ROOM', {
      roomName: `${eventData.title} - Чат`,
      participants: eventData.participants.members,
      eventId: eventData.id,
      roomType: 'event'
    });
  }

  openEventChat(chatRoomId: string) {
    this.emit('CHAT_OPEN_ROOM', { roomId: chatRoomId });
  }

  publishEventActivity(eventData: any, activityType: string) {
    this.emit('ACTIVITY_PUBLISH', {
      type: activityType,
      eventId: eventData.id,
      title: eventData.title,
      description: eventData.description,
      participants: eventData.participants,
      timestamp: new Date().toISOString()
    });
  }

  createEventRoute(eventData: any) {
    this.emit('PLANNER_CREATE_ROUTE', {
      eventId: eventData.id,
      startLocation: eventData.location,
      title: `Маршрут: ${eventData.title}`,
      dates: eventData.dateRange
    });
  }

  importRouteToEvent(routeId: string, eventId: string) {
    this.emit('PLANNER_EXPORT_ROUTE', { routeId, eventId });
  }

  createEventBlog(eventData: any) {
    this.emit('BLOG_CREATE_POST', {
      eventId: eventData.id,
      title: `Отчет: ${eventData.title}`,
      location: eventData.location,
      participants: eventData.participants,
      tags: eventData.metadata.tags
    });
  }

  openEventBlog(blogId: string) {
    this.emit('BLOG_OPEN_POST', { blogId });
  }
}

export const integrationService = new IntegrationService();