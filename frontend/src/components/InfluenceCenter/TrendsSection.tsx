import React from 'react';
import { TrendingUp, MapPin, Map, Users, Heart, MessageCircle, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface TrendsSectionProps {
  className?: string;
}

const TrendsSection: React.FC<TrendsSectionProps> = ({ className = '' }) => {
  // Моковые данные для трендов
  const trendingData = {
    topCategories: [
      { name: 'Достопримечательности', count: 1247, change: '+23%', color: 'blue', icon: '🏛️' },
      { name: 'Рестораны', count: 892, change: '+18%', color: 'red', icon: '🍽️' },
      { name: 'Природа', count: 654, change: '+31%', color: 'green', icon: '🌲' },
      { name: 'Спорт', count: 423, change: '+12%', color: 'orange', icon: '⚽' },
      { name: 'Культура', count: 387, change: '+8%', color: 'purple', icon: '🎭' }
    ],
    hotSpots: [
      { name: 'Красная площадь', location: 'Москва', views: 15420, trend: 'up', icon: '🏛️' },
      { name: 'Эрмитаж', location: 'Санкт-Петербург', views: 12890, trend: 'up', icon: '🎨' },
      { name: 'Озеро Байкал', location: 'Иркутская область', views: 9876, trend: 'up', icon: '🏔️' },
      { name: 'Кремль', location: 'Москва', views: 8765, trend: 'down', icon: '🏰' },
      { name: 'Сочи', location: 'Краснодарский край', views: 7654, trend: 'up', icon: '🏖️' }
    ],
    weeklyStats: [
      { label: 'Новые метки', value: 234, change: '+15%', color: 'blue' },
      { label: 'Созданные маршруты', value: 89, change: '+22%', color: 'green' },
      { label: 'Активные пользователи', value: 1247, change: '+8%', color: 'purple' },
      { label: 'Просмотры контента', value: 15678, change: '+31%', color: 'orange' }
    ],
    popularTags: [
      { tag: '#москва', count: 2341, trend: 'up' },
      { tag: '#природа', count: 1876, trend: 'up' },
      { tag: '#история', count: 1543, trend: 'up' },
      { tag: '#путешествия', count: 1234, trend: 'down' },
      { tag: '#культура', count: 987, trend: 'up' },
      { tag: '#спорт', count: 876, trend: 'up' }
    ]
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Тренды и Статистика
            </h2>
            <p className="text-sm text-muted-foreground">Актуальные данные сообщества</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          За неделю
        </Button>
      </div>

      {/* Топ категории */}
      <Card className="bg-gradient-to-br from-white to-orange-50/50 border-orange-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Популярные категории
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingData.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">{category.count.toLocaleString()} объектов</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getColorClasses(category.color)}`}>
                    {category.change}
                  </Badge>
                  <div className="text-sm font-medium text-orange-600">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Горячие точки */}
      <Card className="bg-gradient-to-br from-white to-red-50/50 border-red-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Горячие точки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingData.hotSpots.map((spot, index) => (
              <div key={spot.name} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{spot.icon}</div>
                  <div>
                    <div className="font-medium">{spot.name}</div>
                    <div className="text-sm text-muted-foreground">{spot.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {spot.views.toLocaleString()} просмотров
                  </div>
                  <Badge 
                    variant={spot.trend === 'up' ? 'default' : 'secondary'}
                    className={spot.trend === 'up' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                  >
                    {spot.trend === 'up' ? '↗' : '↘'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Еженедельная статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {trendingData.weeklyStats.map((stat) => (
          <Card key={stat.label} className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200/50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {stat.label}
                </div>
                <Badge className={`${getColorClasses(stat.color)} text-xs`}>
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Популярные теги */}
      <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            Популярные теги
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trendingData.popularTags.map((tag) => (
              <Badge
                key={tag.tag}
                variant="outline"
                className={`cursor-pointer hover:scale-105 transition-transform ${
                  tag.trend === 'up' 
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tag.tag} ({tag.count})
                {tag.trend === 'up' && <span className="ml-1 text-green-600">↗</span>}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Мотивационная карточка */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Стань частью трендов!</h3>
              <p className="text-blue-100 mb-4">
                Создавай контент, который увидят тысячи пользователей. 
                Твои метки и маршруты могут стать популярными!
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Начать создавать
              </Button>
            </div>
            <div className="text-6xl opacity-20">
              <TrendingUp />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { TrendsSection };
