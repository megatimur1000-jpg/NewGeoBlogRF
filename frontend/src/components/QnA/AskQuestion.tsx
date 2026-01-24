import React, { useState, useMemo } from 'react';
import { QNA_LIMITS, getTodaysCountByUserForPost, submitQuestionForPost } from '../../services/qnaService';
import { useAuth } from '../../contexts/AuthContext';

interface AskQuestionProps {
  postId: number;
  onSubmitted?: () => void;
}

const AskQuestion: React.FC<AskQuestionProps> = ({ postId, onSubmitted }) => {
  const auth = useAuth();
  const userId = auth?.user?.id ? String(auth.user.id) : '';
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCount = useMemo(() => {
    if (!userId) return 0;
    try { return getTodaysCountByUserForPost(userId, postId); } catch { return 0; }
  }, [userId, postId]);

  const remaining = Math.max(0, QNA_LIMITS.maxQuestionsPerPostPerDay - currentCount);
  const overLimit = remaining <= 0;
  const length = text.length;
  const tooLong = length > QNA_LIMITS.maxQuestionLength;

  const handleSubmit = async () => {
    if (!userId) { setError('Требуется вход'); return; }
    if (overLimit) { setError(`Лимит вопросов на сегодня исчерпан`); return; }
    if (!text.trim()) { setError('Вопрос не может быть пустым'); return; }
    if (tooLong) { setError(`Максимум ${QNA_LIMITS.maxQuestionLength} символов`); return; }
    setError(null);
    setSending(true);
    try {
      await submitQuestionForPost(postId, userId, text);
      setText('');
      if (onSubmitted) onSubmitted();
    } catch (e: any) {
      setError(e?.message || 'Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="text-sm font-semibold mb-2">Задать вопрос автору</div>
      <textarea
        className="w-full border rounded px-2 py-2 min-h-[80px]"
        placeholder="Ваш вопрос..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-1 text-xs text-gray-500 flex justify-between">
        <span>Осталось сегодня: {remaining} из {QNA_LIMITS.maxQuestionsPerPostPerDay}</span>
        <span>{length}/{QNA_LIMITS.maxQuestionLength}</span>
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <div className="mt-2 flex gap-2">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={sending || overLimit || tooLong || !text.trim() || !userId}
          onClick={handleSubmit}
        >
          Отправить
        </button>
      </div>
      {!userId && (
        <div className="mt-2 text-xs text-gray-600">Для отправки вопроса войдите в аккаунт</div>
      )}
    </div>
  );
};

export default AskQuestion;


