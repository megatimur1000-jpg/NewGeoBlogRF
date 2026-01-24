import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FaMoneyBill, FaTags, FaClock, FaList, FaChevronDown, FaChevronUp, FaTimes, FaPaperPlane, FaRobot, FaUser
} from 'react-icons/fa';

// --- СТИЛИ КАК НА СКРИНЕ ---
const SelectedParams = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 24px 0 24px;
  min-height: 32px;
`;

const ParamChip = styled.div`
  background: #e3e3e3;
  color: #222;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Wrapper = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
  border: 2px solid #bcbcbc;
  max-width: 332px;
  width: 100%;
  min-width: 262px;
  padding: 0;
  display: flex;
  flex-direction: column;
  font-size: 15px;
  overflow: hidden;
  min-height: 480px;
  height: 100%;
`;

const Header = styled.div`
  background: #e3e3e3;
  color: #222;
  font-size: 1.1em;
  font-weight: bold;
  padding: 16px 24px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  letter-spacing: 0.01em;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

// Стили для чата
const ChatContainer = styled.div`
  padding: 16px 24px;
  border-bottom: 1.5px solid #e3e3e3;
  background: #f8f9fa;
`;

const ChatMessages = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e3e3e3;
`;

const Message = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
  
  ${({ $isUser }) => $isUser ? `
    flex-direction: row-reverse;
  ` : ''}
`;

const MessageIcon = styled.div<{ $isUser: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  background: ${({ $isUser }) => $isUser ? '#007bff' : '#28a745'};
  color: white;
`;

const MessageText = styled.div<{ $isUser: boolean }>`
  background: ${({ $isUser }) => $isUser ? '#007bff' : '#e9ecef'};
  color: ${({ $isUser }) => $isUser ? 'white' : '#333'};
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  max-width: 200px;
  word-wrap: break-word;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e3e3e3;
  border-radius: 20px;
  font-size: 13px;
  outline: none;
  
  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const AccordionBox = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  padding-bottom: 8px;
`;

const AccordionSection = styled.div<{ active?: boolean }>`
  background: ${({ active }) => (active ? '#f4f4f4' : '#fff')};
  color: #222;
  display: flex;
  align-items: center;
  padding: 0;
  border-bottom: 1.5px solid #e3e3e3;
  transition: background 0.2s;
  cursor: pointer;
  position: relative;
  margin-bottom: 6px;
`;

const IconBox = styled.div<{ active?: boolean }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ active }) => (active ? '#e3e3e3' : '#f7f7f7')};
  color: #222;
  font-size: 18px;
  border-right: 1.5px solid #e3e3e3;
`;

const SectionTitle = styled.div`
  flex: 1;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 15px;
  color: #222;
`;

const Chevron = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
`;

const SectionContent = styled.div`
  background: #f7f7f7;
  padding: 16px 20px;
  border-top: 1.5px solid #e3e3e3;
  margin-bottom: 6px;
`;

const RangeInput = styled.input`
  width: 100%;
  margin-bottom: 8px;
`;

// Тип для параметров (убираем transport и priority)
export type PlannerParams = {
  theme: string | null;
  category: string | null;
  tag: string | null;
  date: string;
  time: string;
  duration: number;
  budget: string;
};

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIGuidePanelProps {
  params: PlannerParams;
  onParamsChange: (params: PlannerParams) => void;
  onClose?: () => void;
}

const AIGuidePanel: React.FC<AIGuidePanelProps> = ({ params, onParamsChange, onClose }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Привет! Я твой личный гид. Расскажи, что ты ищешь?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Опции для настроек
const themeOptions = [
    { key: 'museums', label: 'Музеи' },
    { key: 'gastro', label: 'Гастро' },
    { key: 'shopping', label: 'Шопинг' },
    { key: 'parks', label: 'Парки' },
    { key: 'history', label: 'История' },
    { key: 'kids', label: 'С детьми' },
    { key: 'nightlife', label: 'Ночная жизнь' },
    { key: 'sport', label: 'Спорт' },
    { key: 'art', label: 'Искусство' },
  ];
const categoryOptions = [
    { key: 'nature', label: 'Природа' },
    { key: 'sights', label: 'Достопримечательности' },
    { key: 'restaurants', label: 'Рестораны' },
    { key: 'entertainment', label: 'Развлечения' },
    { key: 'events', label: 'События' },
    { key: 'hotels', label: 'Отели' },
    { key: 'spa', label: 'СПА и отдых' },
    { key: 'culture', label: 'Культура' },
    { key: 'service', label: 'Сервис' },
    { key: 'other', label: 'Другое' },
  ];
const tagOptions = [
  { key: 'nature', label: '#природа' },
  { key: 'city', label: '#город' },
  { key: 'food', label: '#еда' },
    { key: 'mountains', label: '#горы' },
    { key: 'sea', label: '#море' },
    { key: 'adventure', label: '#приключения' },
    { key: 'family', label: '#семья' },
    { key: 'romantic', label: '#романтика' },
    { key: 'extreme', label: '#экстрим' },
  ];

  // Функция для анализа сообщения пользователя и применения настроек
  const analyzeUserMessage = (message: string): Partial<PlannerParams> => {
    const lowerMessage = (message || '').toLowerCase();
    const newSettings: Partial<PlannerParams> = {};

    // Анализ темы
    if (lowerMessage.includes('ресторан') || lowerMessage.includes('кафе') || lowerMessage.includes('еда')) {
      newSettings.theme = 'gastro';
    } else if (lowerMessage.includes('музей') || lowerMessage.includes('искусство')) {
      newSettings.theme = 'museums';
    } else if (lowerMessage.includes('шопинг') || lowerMessage.includes('магазин')) {
      newSettings.theme = 'shopping';
    } else if (lowerMessage.includes('парк') || lowerMessage.includes('природа')) {
      newSettings.theme = 'parks';
    } else if (lowerMessage.includes('история') || lowerMessage.includes('памятник')) {
      newSettings.theme = 'history';
    } else if (lowerMessage.includes('спорт') || lowerMessage.includes('фитнес')) {
      newSettings.theme = 'sport';
    }

    // Анализ категории
    if (lowerMessage.includes('ресторан')) {
      newSettings.category = 'restaurants';
    } else if (lowerMessage.includes('достопримечательность') || lowerMessage.includes('памятник')) {
      newSettings.category = 'sights';
    } else if (lowerMessage.includes('развлечение') || lowerMessage.includes('аттракцион')) {
      newSettings.category = 'entertainment';
    } else if (lowerMessage.includes('отель') || lowerMessage.includes('гостиница')) {
      newSettings.category = 'hotels';
    }

    // Анализ тегов
    if (lowerMessage.includes('море') || lowerMessage.includes('пляж')) {
      newSettings.tag = 'sea';
    } else if (lowerMessage.includes('горы')) {
      newSettings.tag = 'mountains';
    } else if (lowerMessage.includes('природа')) {
      newSettings.tag = 'nature';
    } else if (lowerMessage.includes('город')) {
      newSettings.tag = 'city';
    } else if (lowerMessage.includes('еда') || lowerMessage.includes('кухня')) {
      newSettings.tag = 'food';
    }

    // Анализ бюджета
    if (lowerMessage.includes('недорогой') || lowerMessage.includes('дешевый') || lowerMessage.includes('экономный')) {
      newSettings.budget = '1000-3000';
    } else if (lowerMessage.includes('дорогой') || lowerMessage.includes('премиум') || lowerMessage.includes('люкс')) {
      newSettings.budget = '10000+';
    } else if (lowerMessage.includes('средний') || lowerMessage.includes('обычный')) {
      newSettings.budget = '3000-7000';
    }

    return newSettings;
  };

  // Функция для генерации ответа AI
  const generateAIResponse = (userMessage: string, appliedSettings: Partial<PlannerParams>): string => {
    const lowerMessage = (userMessage || '').toLowerCase();
    
    if (lowerMessage.includes('ресторан') && appliedSettings.category === 'restaurants') {
      return 'Отлично! Я настроил поиск ресторанов. Укажи бюджет и время, чтобы я мог найти лучшие варианты.';
    } else if (lowerMessage.includes('море') && appliedSettings.tag === 'sea') {
      return 'Понял! Ищу места у моря. Хочешь отель, ресторан или развлечения?';
    } else if (lowerMessage.includes('недорогой') && appliedSettings.budget) {
      return 'Настроил поиск по экономному бюджету. Что еще важно для тебя?';
    } else {
      return 'Понял твои предпочтения! Могу помочь найти идеальные места. Что еще хочешь уточнить?';
    }
  };

  // Отправка сообщения
  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Анализируем сообщение и применяем настройки
    const appliedSettings = analyzeUserMessage(chatInput);
    
    // Применяем настройки
    if (Object.keys(appliedSettings).length > 0) {
      onParamsChange({ ...params, ...appliedSettings });
    }

    // Генерируем ответ AI
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(chatInput, appliedSettings),
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Обработка Enter в чате
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Секции для "Твой личный гид" (убираем Транспорт и Приоритеты)
  const sections = [
    {
      label: 'Темы',
      icon: <FaList />,
      content: (
        <select
          value={params.theme || ''}
          onChange={e => onParamsChange({ ...params, theme: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 14,
            background: '#e3e3e3',
            color: '#222',
            border: 'none',
            marginBottom: 8,
          }}
        >
          <option value="">Выберите тему</option>
          {themeOptions.map(opt => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: 'Категории',
      icon: <FaTags />,
      content: (
        <select
          value={params.category || ''}
          onChange={e => onParamsChange({ ...params, category: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 14,
            background: '#e3e3e3',
            color: '#222',
            border: 'none',
            marginBottom: 8,
          }}
        >
          <option value="">Выберите категорию</option>
          {categoryOptions.map(opt => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: 'Теги',
      icon: <FaTags />,
      content: (
        <select
          value={params.tag || ''}
          onChange={e => onParamsChange({ ...params, tag: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 14,
            background: '#e3e3e3',
            color: '#222',
            border: 'none',
            marginBottom: 8,
          }}
        >
          <option value="">Выберите тег</option>
              {tagOptions.map(opt => (
            <option key={opt.key} value={opt.key}>
                  {opt.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: 'Время',
      icon: <FaClock />,
      content: (
        <>
            <Input type="date" value={params.date} onChange={e => onParamsChange({ ...params, date: e.target.value })} />
            <Input type="time" value={params.time} onChange={e => onParamsChange({ ...params, time: e.target.value })} />
            <RangeInput
              type="range"
              min={1}
              max={12}
              value={params.duration}
              onChange={e => onParamsChange({ ...params, duration: Number(e.target.value) })}
            />
            <div style={{ color: '#555', fontSize: 14 }}>Длительность: {params.duration} ч.</div>
        </>
      ),
    },
    {
      label: 'Бюджет',
      icon: <FaMoneyBill />,
      content: (
            <Input
              type="text"
              placeholder="Общий бюджет, ₽"
              value={params.budget}
              onChange={e => onParamsChange({ ...params, budget: e.target.value })}
            />
      ),
    },
  ];

  return (
    <Wrapper>
      <Header>
        <span>Твой личный гид</span>
        {onClose && (
          <CloseButton onClick={onClose}>
            <FaTimes size={16} />
          </CloseButton>
        )}
      </Header>
      
      {/* Чат с AI гидом */}
      <ChatContainer>
        <ChatMessages>
          {chatMessages.map((message) => (
            <Message key={message.id} $isUser={message.isUser}>
              <MessageIcon $isUser={message.isUser}>
                {message.isUser ? <FaUser size={10} /> : <FaRobot size={10} />}
              </MessageIcon>
              <MessageText $isUser={message.isUser}>
                {message.text}
              </MessageText>
            </Message>
          ))}
          {isTyping && (
            <Message $isUser={false}>
              <MessageIcon $isUser={false}>
                <FaRobot size={10} />
              </MessageIcon>
              <MessageText $isUser={false}>
                Печатает...
              </MessageText>
            </Message>
          )}
        </ChatMessages>
        
        <ChatInput>
          <Input
            type="text"
            placeholder="Напиши что ищешь..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleChatKeyPress}
          />
          <SendButton 
            onClick={sendMessage}
            disabled={!chatInput.trim() || isTyping}
          >
            <FaPaperPlane size={12} />
          </SendButton>
        </ChatInput>
      </ChatContainer>
      
      {/* Выбранные параметры (убираем transport и priority) */}
      <SelectedParams>
        {params.theme && <ParamChip>Тема: {themeOptions.find(opt => opt.key === params.theme)?.label}</ParamChip>}
        {params.category && <ParamChip>Категория: {categoryOptions.find(opt => opt.key === params.category)?.label}</ParamChip>}
        {params.tag && <ParamChip>Тег: {tagOptions.find(opt => opt.key === params.tag)?.label}</ParamChip>}
        {params.date && <ParamChip>Дата: {params.date}</ParamChip>}
        {params.time && <ParamChip>Время: {params.time}</ParamChip>}
        {params.budget && <ParamChip>Бюджет: {params.budget} ₽</ParamChip>}
      </SelectedParams>
      
      <AccordionBox>
        {sections.map((section, idx) => (
          <React.Fragment key={section.label}>
            <AccordionSection
              active={openIdx === idx}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <IconBox active={openIdx === idx}>{section.icon}</IconBox>
              <SectionTitle>{section.label}</SectionTitle>
              <Chevron>
                {openIdx === idx ? <FaChevronUp /> : <FaChevronDown />}
              </Chevron>
            </AccordionSection>
            {openIdx === idx && (
              <SectionContent>
                {section.content}
              </SectionContent>
            )}
          </React.Fragment>
        ))}
      </AccordionBox>
    </Wrapper>
  );
};

export default AIGuidePanel;
