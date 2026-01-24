/**
 * Типовые причины отклонения контента
 */
export const REJECTION_REASONS = {
  spam: {
    id: 'spam',
    label: 'Спам',
    description: 'Реклама, навязчивые ссылки, повторяющийся контент'
  },
  inappropriate: {
    id: 'inappropriate',
    label: 'Неподходящий контент',
    description: 'Оскорбления, нецензурная лексика, провокации'
  },
  fake: {
    id: 'fake',
    label: 'Фейковая информация',
    description: 'Ложная информация, обман, мошенничество'
  },
  low_quality: {
    id: 'low_quality',
    label: 'Низкое качество',
    description: 'Недостаточно информации, неполный контент, опечатки'
  },
  off_topic: {
    id: 'off_topic',
    label: 'Не по теме',
    description: 'Контент не относится к путешествиям и туризму'
  },
  duplicate: {
    id: 'duplicate',
    label: 'Дубликат',
    description: 'Повторяющийся контент, уже опубликован ранее'
  },
  copyright: {
    id: 'copyright',
    label: 'Нарушение авторских прав',
    description: 'Использование чужих материалов без разрешения'
  },
  incomplete: {
    id: 'incomplete',
    label: 'Незавершённый контент',
    description: 'Контент не завершён, требует доработки'
  },
  other: {
    id: 'other',
    label: 'Другое',
    description: 'Укажите причину в комментарии'
  }
};

/**
 * Получить список причин для отображения
 */
export function getRejectionReasons() {
  return Object.values(REJECTION_REASONS);
}

/**
 * Получить причину по ID
 */
export function getRejectionReason(id) {
  return REJECTION_REASONS[id] || REJECTION_REASONS.other;
}

