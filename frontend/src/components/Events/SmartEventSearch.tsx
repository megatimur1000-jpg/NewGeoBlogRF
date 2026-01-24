import React, { useState, useCallback } from 'react';
import { externalEventsService } from '../../services/externalEventsService';
// Категории событий
const categories = [
  'Авиабилеты', 'Отели', 'Достопримечательности', 'Рестораны', 'Транспорт', 'Экскурсии',
  'Праздник', 'Фестиваль', 'Концерт', 'Спорт', 'Рыболовное соревнование', 'Октоберфест',
  'Парад', 'Театр', 'Ярмарка', 'История/Наследие', 'Для детей', 'Ночная жизнь'
];
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { FaSearch, FaListAlt, FaCalendar } from 'react-icons/fa';
import styled from 'styled-components';

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  participants: number;
  maxCapacity: number;
  source: string;
}

interface SmartEventSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartEventSearch: React.FC<SmartEventSearchProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    search: true,
    categories: true,
    dates: true,
    results: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && !location.trim() && selectedCategories.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const searchParams = {
        query: searchQuery,
        location,
        categories: selectedCategories,
        startDate,
        endDate
      };
      
      const results = await externalEventsService.searchEvents(searchParams);
      // Адаптируем ExternalEvent в LocalEvent
      const adaptedEvents: LocalEvent[] = results.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.start_date,
        location: event.location?.address || '',
        category: event.category || '',
        participants: event.attendees_count || 0,
        maxCapacity: (event.attendees_count || 0) + 10, // Примерная оценка
        source: event.source
      }));
      setEvents(adaptedEvents);
      setOpenSections(prev => ({ ...prev, results: true }));
    } catch (error) {
      } finally {
      setIsLoading(false);
    }
  }, [searchQuery, location, selectedCategories, startDate, endDate]);

  const handleAddEvent = (event: LocalEvent) => {
    // Логика добавления события
  };

  const handleAddToBlog = (event: LocalEvent) => {
    // Логика добавления в блог
  };

  const handleEventDetails = (event: LocalEvent) => {
    // Логика перехода к деталям
  };

  if (!isOpen) return null;

  return (
    <Wrapper>
      {/* Заголовок убран - используется GlassHeader из родительского компонента */}
      <AccordionBox>
        <AccordionSection
          active={openSections.search}
          onClick={() => toggleSection('search')}
        >
          <IconBox active={openSections.search}>
            <FaSearch />
          </IconBox>
          <SectionTitle>Поиск событий</SectionTitle>
          <CheckCircle completed={false} />
          <Chevron>
            {openSections.search ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Chevron>
        </AccordionSection>
        
        {openSections.search && (
          <SectionContent>
            <Input
               type="text"
              placeholder="Поиск событий..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Input
                 type="text"
              placeholder="Местоположение..."
                 value={location}
                 onChange={(e) => setLocation(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Поиск...' : 'Найти события'}
            </Button>
            
            <PopularSearches>
              <PopularTitle>Популярные поиски:</PopularTitle>
              <PopularGrid>
                <PopularButton onClick={() => setSearchQuery('Концерты')}>Концерты</PopularButton>
                <PopularButton onClick={() => setSearchQuery('Выставки')}>Выставки</PopularButton>
                <PopularButton onClick={() => setSearchQuery('Фестивали')}>Фестивали</PopularButton>
                <PopularButton onClick={() => setSearchQuery('Спорт')}>Спорт</PopularButton>
              </PopularGrid>
            </PopularSearches>
          </SectionContent>
        )}

        <AccordionSection
          active={openSections.categories}
          onClick={() => toggleSection('categories')}
        >
          <IconBox active={openSections.categories}>
            <FaListAlt />
          </IconBox>
          <SectionTitle>Категории событий</SectionTitle>
          <CheckCircle completed={false} />
          <Chevron>
            {openSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Chevron>
        </AccordionSection>
          
        {openSections.categories && (
          <SectionContent>
            <CategorySelect
              multiple
              value={selectedCategories}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedCategories(values);
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                 </option>
               ))}
            </CategorySelect>
            
            {selectedCategories.length > 0 && (
              <ClearButton onClick={handleClearCategories}>
                Очистить выбор
              </ClearButton>
            )}
          </SectionContent>
        )}

        <AccordionSection
          active={openSections.dates}
          onClick={() => toggleSection('dates')}
        >
          <IconBox active={openSections.dates}>
            <FaCalendar />
          </IconBox>
          <SectionTitle>Временные рамки</SectionTitle>
          <CheckCircle completed={false} />
          <Chevron>
            {openSections.dates ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Chevron>
        </AccordionSection>
          
        {openSections.dates && (
          <SectionContent>
            <DateInputs>
              <DateInput
                 type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                 placeholder="Дата начала"
               />
              <DateInput
                 type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                 placeholder="Дата окончания"
               />
            </DateInputs>
          </SectionContent>
        )}

        {events.length > 0 && (
          <>
            <AccordionSection
              active={openSections.results}
              onClick={() => toggleSection('results')}
            >
              <IconBox active={openSections.results}>
                <FaListAlt />
              </IconBox>
              <SectionTitle>Результаты поиска ({events.length})</SectionTitle>
              <CheckCircle completed={false} />
              <Chevron>
                {openSections.results ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Chevron>
            </AccordionSection>
            
            {openSections.results && (
              <SectionContent>
                <SearchResults>
                  {events.map((event) => (
                    <EventCard key={event.id}>
                      <EventTitle>{event.title}</EventTitle>
                      <EventDetails>
                        <DetailItem>📅 {event.date}</DetailItem>
                        <DetailItem>📍 {event.location}</DetailItem>
                        <DetailItem>👥 {event.participants}/{event.maxCapacity}</DetailItem>
                      </EventDetails>
                      <EventActions>
                        <ActionButton onClick={() => handleAddEvent(event)}>
                      Выбрать
                        </ActionButton>
                        <ActionButton onClick={() => handleEventDetails(event)}>
                         Подробнее
                        </ActionButton>
                        <ActionButton onClick={() => handleAddToBlog(event)}>
                          В блог
                        </ActionButton>
                      </EventActions>
                    </EventCard>
                  ))}
                </SearchResults>
              </SectionContent>
            )}
          </>
        )}
      </AccordionBox>

      <Footer>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Поиск...' : 'Найти события'}
        </Button>
        <Button onClick={() => {}}>
          В блог
        </Button>
      </Footer>
    </Wrapper>
  );
};

// Styled Components - обновлены для матового стекла
const Wrapper = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border: none;
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: hidden;
  color: #000000;
`;

const Header = styled.div`
  display: none; /* Заголовок убран - используется GlassHeader */
`;

const HeaderTitle = styled.div`
  display: none;
`;

const CloseButton = styled.button`
  display: none; /* Кнопка закрытия убрана - используется GlassHeader */
`;

const AccordionBox = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  border: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #000000;
  font-size: 16px;
`;

const AccordionSection = styled.div<{ active?: boolean }>`
  background: ${({ active }) => active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #000000;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const IconBox = styled.div<{ active?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 1.1em;
`;

const SectionTitle = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: 16px;
  padding: 0 0 0 2px;
  color: #000000;
`;

const CheckCircle = styled.span<{ completed: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${({ completed }) => (completed ? '#7bc043' : '#bbb')};
  background: ${({ completed }) => (completed ? '#7bc043' : 'transparent')};
  display: inline-block;
  margin-left: 6px;
  transition: background 0.2s, border 0.2s;
  position: relative;
  &::after {
    content: '';
    display: ${({ completed }) => (completed ? 'block' : 'none')};
    position: absolute;
    left: 3px; top: 1px;
    width: 4px; height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const Chevron = styled.div`
  padding: 0 10px;
  color: #000000;
  font-size: 1em;
  cursor: pointer;
`;

const SectionContent = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #000000;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 4px;
  margin-bottom: 8px;
  animation: fadeIn 0.2s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px);}
    to { opacity: 1; transform: none;}
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  color: #000000;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 8px;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(0, 0, 0, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }
`;

const CategorySelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  color: #000000;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 8px;
  min-height: 120px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }
`;

const ClearButton = styled.button`
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  color: #000000 !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DateInputs = styled.div`
  display: flex;
  gap: 10px;
`;

const DateInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  color: #000000;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }
`;

const PopularSearches = styled.div`
  margin-top: 15px;
`;

const PopularTitle = styled.div`
  font-size: 0.9em;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
`;

const PopularGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const PopularButton = styled.button`
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  color: #000000 !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-1px);
  }
`;

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const EventCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const EventTitle = styled.h4`
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const EventDetails = styled.div`
  margin-bottom: 15px;
`;

const DetailItem = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const EventActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  color: #000000 !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Footer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: #000000;
  font-weight: 600;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  color: #000000 !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
`;

export { SmartEventSearch };
