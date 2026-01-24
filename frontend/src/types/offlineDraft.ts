export interface OfflineDraft {
  id: string;
  type: 'post' | 'marker' | 'route' | 'event';
  content: any;
  createdAt: number;
  status: 'draft' | 'pending' | 'failed';
}
