export function generateEventId(): string;
export function validateEventData(eventData: any): string[];
export function calculateEventProgress(event: any): number;
export function getEventPriority(event: any): string;
export function canUserJoinEvent(event: any, userId: string): any;
export function getEventNotifications(event: any, userId: string): any[];
