export const generateEventId = () => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  export const validateEventData = (eventData) => {
    const errors = [];
    
    if (!eventData.title || eventData.title.trim().length < 3) {
      errors.push('Название события должно содержать минимум 3 символа');
    }
    
    if (!eventData.description || eventData.description.trim().length < 10) {
      errors.push('Описание должно содержать минимум 10 символов');
    }
    
    if (!eventData.dateRange.start) {
      errors.push('Укажите дату начала события');
    }
    
    if (!eventData.dateRange.end) {
      errors.push('Укажите дату окончания события');
    }
    
    if (eventData.dateRange.start && eventData.dateRange.end) {
      const start = new Date(eventData.dateRange.start);
      const end = new Date(eventData.dateRange.end);
      
      if (start >= end) {
        errors.push('Дата окончания должна быть позже даты начала');
      }
      
      if (start < new Date()) {
        errors.push('Дата начала не может быть в прошлом');
      }
    }
    
    if (!eventData.location.address || eventData.location.address.trim().length < 3) {
      errors.push('Укажите место проведения события');
    }
    
    if (eventData.maxCapacity < 2 || eventData.maxCapacity > 100) {
      errors.push('Количество участников должно быть от 2 до 100');
    }
    
    return errors;
  };
  
  export const calculateEventProgress = (event) => {
    const now = new Date();
    const start = new Date(event.dateRange.start);
    const end = new Date(event.dateRange.end);
    
    if (now < start) {
      // Event hasn't started - calculate preparation progress
      const createdAt = new Date(event.createdAt);
      const totalPrepTime = start - createdAt;
      const elapsedPrepTime = now - createdAt;
      
      return Math.min(Math.max((elapsedPrepTime / totalPrepTime) * 100, 0), 100);
    } else if (now >= start && now <= end) {
      // Event is active - calculate completion progress
      const totalEventTime = end - start;
      const elapsedEventTime = now - start;
      
      return Math.min(Math.max((elapsedEventTime / totalEventTime) * 100, 0), 100);
    } else {
      // Event is completed
      return 100;
    }
  };
  
  export const getEventPriority = (event) => {
    const daysUntil = getDaysUntilEvent(event.dateRange.start);
    const participantRatio = event.participants.members.length / event.participants.maxCapacity;
    
    if (daysUntil <= 3) return 'high';
    if (daysUntil <= 7 && participantRatio > 0.8) return 'high';
    if (daysUntil <= 14) return 'medium';
    return 'low';
  };
  
  export const canUserJoinEvent = (event, userId) => {
    const isAlreadyMember = event.participants.members.includes(userId);
    const isAtCapacity = event.participants.members.length >= event.participants.maxCapacity;
    const hasJoinRequest = event.participants.joinRequests.includes(userId);
    const isEventActive = ['planning', 'active'].includes(event.status);
    
    return {
      canJoin: !isAlreadyMember && !hasJoinRequest && isEventActive,
      needsApproval: isAtCapacity,
      reason: isAlreadyMember ? 'already_member' : 
              hasJoinRequest ? 'request_pending' :
              !isEventActive ? 'event_not_active' :
              isAtCapacity ? 'at_capacity' : 'can_join'
    };
  };
  
  export const getEventNotifications = (event, userId) => {
    const notifications = [];
    const now = new Date();
    const start = new Date(event.dateRange.start);
    const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    
    if (event.participants.members.includes(userId)) {
      if (daysUntil === 1) {
        notifications.push({
          type: 'reminder',
          message: 'Событие начинается завтра!',
          priority: 'high'
        });
      } else if (daysUntil === 7) {
        notifications.push({
          type: 'reminder',
          message: 'Событие начинается через неделю',
          priority: 'medium'
        });
      }
    }
    
    if (event.participants.organizer === userId) {
      const participantRatio = event.participants.members.length / event.participants.maxCapacity;
      
      if (participantRatio < 0.5 && daysUntil <= 14) {
        notifications.push({
          type: 'warning',
          message: 'Мало участников для события',
          priority: 'medium'
        });
      }
      
      if (event.participants.joinRequests.length > 0) {
        notifications.push({
          type: 'action',
          message: `${event.participants.joinRequests.length} новых заявок`,
          priority: 'high'
        });
      }
    }
    
    return notifications;
  };