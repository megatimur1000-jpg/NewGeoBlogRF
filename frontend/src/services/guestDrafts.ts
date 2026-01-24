// Simple guest drafts storage in localStorage

export type DraftType = 'post' | 'marker' | 'route';

export interface GuestDraft<T = any> {
  id: string; // generated
  type: DraftType;
  data: T;
  createdAt: string;
}

const STORAGE_KEY = 'geoblog_guest_drafts_v1';
import storageService from './storageService';

function loadAll(): GuestDraft[] {
  try {
    const raw = storageService.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(drafts: GuestDraft[]) {
  storageService.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function saveDraft<T = any>(type: DraftType, data: T): GuestDraft<T> {
  const all = loadAll();
  const draft: GuestDraft<T> = {
    id: `${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    type,
    data,
    createdAt: new Date().toISOString(),
  };
  all.unshift(draft);
  saveAll(all);
  return draft;
}

export function listDrafts(type?: DraftType): GuestDraft[] {
  const all = loadAll();
  if (!type) return all;
  return all.filter(d => d.type === type);
}

export function removeDraft(id: string) {
  const all = loadAll();
  saveAll(all.filter(d => d.id !== id));
}

export function clearDrafts(type?: DraftType) {
  if (!type) {
    storageService.removeItem(STORAGE_KEY);
    return;
  }
  const all = loadAll();
  saveAll(all.filter(d => d.type !== type));
}


