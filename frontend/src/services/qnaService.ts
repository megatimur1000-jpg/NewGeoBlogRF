export type QnaStatus = 'submitted' | 'moderation' | 'to_author' | 'answered_by_author' | 'published' | 'rejected';

export interface QnaQuestion {
  id: string;
  postId?: number;
  blogId?: string;
  userId: string;
  body: string;
  status: QnaStatus;
  createdAt: number;
}

export interface QnaAnswer {
  id: string;
  questionId: string;
  authorId: string; // author of the post/blog
  body: string;
  status: QnaStatus;
  createdAt: number;
}

export interface QnaPair {
  question: QnaQuestion;
  answer: QnaAnswer | null;
}

const STORAGE_KEY = 'qna.storage.v1';

interface StorageShape {
  questions: QnaQuestion[];
  answers: QnaAnswer[];
}

import storageService from './storageService';

function load(): StorageShape {
  try {
    const raw = storageService.getItem(STORAGE_KEY);
    if (!raw) return { questions: [], answers: [] };
    return JSON.parse(raw);
  } catch {
    return { questions: [], answers: [] };
  }
}

function save(data: StorageShape) {
  storageService.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
}

export const QNA_LIMITS = {
  maxQuestionLength: 2000,
  maxQuestionsPerPostPerDay: 3,
};

export function getTodaysCountByUserForPost(userId: string, postId: number): number {
  const { questions } = load();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const since = startOfDay.getTime();
  return questions.filter(q => q.userId === userId && q.postId === postId && q.createdAt >= since).length;
}

export async function submitQuestionForPost(postId: number, userId: string, body: string): Promise<QnaQuestion> {
  const text = (body || '').trim();
  if (!text) throw new Error('Вопрос не может быть пустым');
  if (text.length > QNA_LIMITS.maxQuestionLength) throw new Error(`Максимум ${QNA_LIMITS.maxQuestionLength} символов`);

  const today = getTodaysCountByUserForPost(userId, postId);
  if (today >= QNA_LIMITS.maxQuestionsPerPostPerDay) {
    throw new Error(`Лимит: ${QNA_LIMITS.maxQuestionsPerPostPerDay} вопроса в день на пост`);
  }

  const now = Date.now();
  const question: QnaQuestion = {
    id: uid('q'),
    postId,
    userId,
    body: text,
    status: 'submitted',
    createdAt: now,
  };

  const data = load();
  data.questions.push(question);
  save(data);
  return question;
}

export async function listPublishedPairsForPost(postId: number): Promise<QnaPair[]> {
  const { questions, answers } = load();
  const related = questions.filter(q => q.postId === postId && q.status === 'published');
  return related.map(q => {
    const ans = answers.find(a => a.questionId === q.id && a.status === 'published') || null;
    return { question: q, answer: ans };
  });
}

// Placeholder APIs for future moderation/author inbox
export async function listQuestionsForAuthorInbox(authorId: string): Promise<QnaQuestion[]> {
  const { questions } = load();
  return questions.filter(q => q.status === 'to_author');
}

export async function publishAnswer(questionId: string, authorId: string, body: string): Promise<QnaAnswer> {
  const text = (body || '').trim();
  if (!text) throw new Error('Ответ не может быть пустым');
  const data = load();
  const answer: QnaAnswer = {
    id: uid('a'),
    questionId,
    authorId,
    body: text,
    status: 'published',
    createdAt: Date.now(),
  };
  data.answers.push(answer);
  // Also mark question published (for demo; later via moderation)
  const q = data.questions.find(x => x.id === questionId);
  if (q) q.status = 'published';
  save(data);
  return answer;
}


