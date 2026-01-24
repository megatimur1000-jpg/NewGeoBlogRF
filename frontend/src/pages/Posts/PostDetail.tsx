import React, { useEffect, useState } from 'react';
import { PostDTO, ReplyDTO, listReplies, createReply, MapSnapshot } from '../../services/postsService';
import AskQuestion from '../../components/QnA/AskQuestion';
import QAPairs from '../../components/QnA/QAPairs';
import { listPublishedPairsForPost, QnaPair } from '../../services/qnaService';
import storageService from '../../services/storageService';
import { useLayoutState } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';

interface PostDetailProps {
  post: PostDTO | null;
  onBack: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  const { user } = useAuth() || { user: null } as any;
  const isAdmin = user?.role === 'admin';
  const [replies, setReplies] = useState<ReplyDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [moderating, setModerating] = useState(false);
  // Автосохранение черновика в localStorage
  useEffect(() => {
    if (!post) return;
    const key = `post-draft-${post.id}`;
    const saved = storageService.getItem(key);
    if (saved && !replyBody) setReplyBody(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  useEffect(() => {
    if (!post) return;
    const key = `post-draft-${post.id}`;
    const h = setTimeout(() => {
      if (replyBody) storageService.setItem(key, replyBody);
      else storageService.removeItem(key);
    }, 400);
    return () => clearTimeout(h);
  }, [post?.id, replyBody]);
  const layout = useLayoutState();
  
  // Состояние для прикрепления в ответах
  const [attachedRouteId, setAttachedRouteId] = useState<number | null>(null);
  const [attachedMarkerId, setAttachedMarkerId] = useState<number | null>(null);
  const [attachedEventId, setAttachedEventId] = useState<number | null>(null);
  const [attachedSnapshot, setAttachedSnapshot] = useState<MapSnapshot | null>(null);
  const [qaPairs, setQaPairs] = useState<QnaPair[]>([]);

  // Функция для прикрепления текущего состояния карты
  const attachCurrentState = () => {
    if (!layout) return;
    
    // Собираем текущие ID из контекста
    const routeId = layout.selectedRouteId || layout.currentRouteId; // Приоритет выбранному маршруту
    const markerId = layout.currentMarkerId;
    const eventId = layout.currentEventId;
    
    // Создаём снапшот карты (заглушка - в реальности нужно получать из карты)
    const snapshot: MapSnapshot = {
      id: `snapshot-${Date.now()}`,
      center: [55.7558, 37.6176], // Москва по умолчанию
      zoom: 10,
      bounds: [[37.0, 55.0], [38.0, 56.0]],
      markers: [],
      routes: [],
      events: []
    };
    
    // Очищаем предыдущие прикрепления
    setAttachedRouteId(null);
    setAttachedMarkerId(null);
    setAttachedEventId(null);
    setAttachedSnapshot(null);
    
    // Прикрепляем что есть
    if (routeId) setAttachedRouteId(routeId);
    else if (markerId) setAttachedMarkerId(markerId);
    else if (eventId) setAttachedEventId(eventId);
    else setAttachedSnapshot(snapshot); // Если нет конкретного объекта, прикрепляем снапшот
  };

  // Функция для очистки прикреплений
  const clearAttachments = () => {
    setAttachedRouteId(null);
    setAttachedMarkerId(null);
    setAttachedEventId(null);
    setAttachedSnapshot(null);
  };

  useEffect(() => {
    if (!post) return;
    const run = async () => {
      setLoading(true);
      try {
        const data = await listReplies(post.id, {});
        setReplies(data.data);
        const pairs = await listPublishedPairsForPost(Number(post.id));
        setQaPairs(pairs);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [post?.id]);

  const openInLeftPane = (reply: ReplyDTO) => {
    if (!layout) return;
    // Route
    if (reply.route_id) {
      layout.setRouteDataForBlog && layout.setRouteDataForBlog({
        title: `Маршрут #${reply.route_id}`,
        points: [],
      });
      return;
    }
    // Marker
    if (reply.marker_id) {
      layout.setMarkerDataForBlog && layout.setMarkerDataForBlog({
        id: String(reply.marker_id),
        title: `Метка #${reply.marker_id}`,
        latitude: 0,
        longitude: 0,
      });
      return;
    }
    // Event (placeholder: open planner)
    if (reply.event_id) {
      return;
    }
  };

  const onCreateReply = async () => {
    if (!post) return;
    const body = replyBody.trim();
    if (!body) return;
    setSending(true);
    try {
      const created = await createReply({
        post_id: post.id,
        body,
        route_id: attachedRouteId?.toString() || undefined,
        marker_id: attachedMarkerId?.toString() || undefined,
        event_id: attachedEventId?.toString() || undefined,
        payload: attachedSnapshot ? { snapshot: attachedSnapshot } : undefined
      });
      setReplies(prev => [...prev, created]);
      setReplyBody('');
      if (post) storageService.removeItem(`post-draft-${post.id}`);
      clearAttachments();
    } finally {
      setSending(false);
    }
  };

  const handleModerate = async (action: 'approve' | 'reject' | 'revision') => {
    if (!post || !isAdmin) return;
    setModerating(true);
    try {
      const token = storageService.getItem('token');
      if (!token) {
        alert('Требуется авторизация');
        return;
      }

      if (action === 'approve') {
        await apiClient.post(`/moderation/posts/${post.id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Пост одобрен');
      } else if (action === 'reject') {
        const reason = prompt('Причина отклонения:');
        if (reason !== null) {
          await apiClient.post(`/moderation/posts/${post.id}/reject`, { reason }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert('Пост отклонён');
        }
      } else if (action === 'revision') {
        const reason = prompt('Причина отправки на доработку:');
        if (reason !== null) {
          await apiClient.post(`/moderation/posts/${post.id}/revision`, { reason }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert('Пост отправлен на доработку');
        }
      }
      
      // Перезагружаем страницу для обновления статуса
      window.location.reload();
    } catch (err: any) {
      console.error('Ошибка модерации:', err);
      alert(err.response?.data?.message || 'Ошибка модерации');
    } finally {
      setModerating(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="p-3 border-b flex items-center gap-2">
        <button className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50" onClick={onBack} disabled={sending}>◀ Назад</button>
        <div className="font-semibold truncate">{post?.title || 'Заметка'}</div>
      </div>
      <div className="p-3 border-b">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="text-gray-800 whitespace-pre-wrap">{post?.body}</div>
            <div className="text-xs text-gray-500 mt-2">
              {post?.author_name ? `Автор: ${post.author_name}` : 'Анонимно'} · {post ? new Date(post.created_at).toLocaleString() : ''}
            </div>
          </div>
          {isAdmin && post?.status === 'pending' && (
            <div className="ml-4 flex flex-col gap-2">
              <button
                onClick={() => handleModerate('approve')}
                disabled={moderating}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                Одобрить
              </button>
              <button
                onClick={() => handleModerate('revision')}
                disabled={moderating}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
              >
                На доработку
              </button>
              <button
                onClick={() => handleModerate('reject')}
                disabled={moderating}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
              >
                Отклонить
              </button>
            </div>
          )}
          {isAdmin && post?.status && post.status !== 'pending' && (
            <div className="ml-4">
              <span className={`px-3 py-1 rounded text-sm ${
                post.status === 'active' ? 'bg-green-100 text-green-700' :
                post.status === 'rejected' ? 'bg-red-100 text-red-700' :
                post.status === 'revision' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {post.status === 'active' ? 'Одобрено' :
                 post.status === 'rejected' ? 'Отклонено' :
                 post.status === 'revision' ? 'На доработке' :
                 post.status}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 text-sm text-gray-700">Ответы</div>
      {/* Q&A block */}
      {post?.id && (
        <div className="px-3 pb-2">
          <AskQuestion postId={Number(post.id)} onSubmitted={async () => {
            const pairs = await listPublishedPairsForPost(Number(post.id!));
            setQaPairs(pairs);
          }} />
          <div className="mt-3">
            <QAPairs pairs={qaPairs} />
          </div>
        </div>
      )}
      {/* Composer */}
      <div className="px-3 pb-2">
        <textarea
          className="w-full border rounded px-2 py-2 min-h-[64px]"
          placeholder="Напишите ответ..."
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
        />
        
        {/* Чипы прикреплений для ответов */}
        {(attachedRouteId || attachedMarkerId || attachedEventId || attachedSnapshot) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachedRouteId && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                <span>📍 Маршрут #{attachedRouteId}</span>
                <button onClick={clearAttachments} className="text-blue-600 hover:text-blue-800">×</button>
              </div>
            )}
            {attachedMarkerId && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                <span>📍 Метка #{attachedMarkerId}</span>
                <button onClick={clearAttachments} className="text-green-600 hover:text-green-800">×</button>
              </div>
            )}
            {attachedEventId && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                <span>📅 Событие #{attachedEventId}</span>
                <button onClick={clearAttachments} className="text-purple-600 hover:text-purple-800">×</button>
              </div>
            )}
            {attachedSnapshot && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">
                <span>🗺️ Карта</span>
                <button onClick={clearAttachments} className="text-gray-600 hover:text-gray-800">×</button>
              </div>
            )}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors"
            onClick={attachCurrentState}
          >
            Прикрепить
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={!replyBody.trim() || sending}
            onClick={onCreateReply}
          >
            Ответить
          </button>
        </div>
      </div>
      {loading && <div className="p-3 text-gray-500">Загрузка...</div>}
      {sending && <div className="px-3 text-xs text-gray-500">Отправка ответа…</div>}
      <div className="flex-1 overflow-auto">
        <ul className="divide-y">
          {replies.map(r => (
            <li key={r.id} className="p-3">
              <div className="whitespace-pre-wrap">{r.body}</div>
              <div className="text-xs text-gray-500 mt-1">
                {r.author_name ? `Автор: ${r.author_name}` : 'Анонимно'} · {new Date(r.created_at).toLocaleString()}
              </div>
              {/* Чипы прикреплений в ответах */}
              {(r.route_id || r.marker_id || r.event_id || r.payload?.snapshot) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.route_id && (
                    <button
                      onClick={() => openInLeftPane(r)}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 transition-colors"
                    >
                      📍 Маршрут #{r.route_id}
                    </button>
                  )}
                  {r.marker_id && (
                    <button
                      onClick={() => openInLeftPane(r)}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs hover:bg-green-200 transition-colors"
                    >
                      📍 Метка #{r.marker_id}
                    </button>
                  )}
                  {r.event_id && (
                    <button
                      onClick={() => openInLeftPane(r)}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs hover:bg-purple-200 transition-colors"
                    >
                      📅 Событие #{r.event_id}
                    </button>
                  )}
                  {r.payload?.snapshot && (
                    <button
                      onClick={() => openInLeftPane(r)}
                      className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs hover:bg-gray-200 transition-colors"
                    >
                      🗺️ Карта
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
          {!loading && replies.length === 0 && (
            <li className="p-3 text-gray-500">Пока нет ответов</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PostDetail;
