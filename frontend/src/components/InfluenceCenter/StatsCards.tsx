import { MapPin, Navigation, Calendar, BookOpen, Users, Trophy, Star, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const stats = [
  { 
    icon: MapPin, 
    label: "Маркеров на карте", 
    value: "2,847", 
    color: "text-blue-500", 
    bg: "bg-blue-500/10", 
    growth: "+18%",
    description: "Уникальные места открыты"
  },
  { 
    icon: Navigation, 
    label: "Маршрутов создано", 
    value: "1,156", 
    color: "text-green-500", 
    bg: "bg-green-500/10", 
    growth: "+32%",
    description: "Путешествия спланированы"
  },
  { 
    icon: Calendar, 
    label: "Событий проведено", 
    value: "423", 
    color: "text-purple-500", 
    bg: "bg-purple-500/10", 
    growth: "+25%",
    description: "Активность сообщества"
  },
  { 
    icon: BookOpen, 
    label: "Блогов написано", 
    value: "892", 
    color: "text-orange-500", 
    bg: "bg-orange-500/10", 
    growth: "+41%",
    description: "Истории путешествий"
  },
  { 
    icon: Users, 
    label: "Активных исследователей", 
    value: "1,247", 
    color: "text-cyan-500", 
    bg: "bg-cyan-500/10", 
    growth: "+22%",
    description: "Участников сообщества"
  },
  { 
    icon: Trophy, 
    label: "Достижений получено", 
    value: "3,456", 
    color: "text-yellow-500", 
    bg: "bg-yellow-500/10", 
    growth: "+67%",
    description: "Награды за активность"
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1" 
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Zap className="w-3 h-3" />
                {stat.growth}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-700">{stat.label}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{stat.description}</div>
            </div>
            
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-500/5 to-yellow-500/5 rounded-full -ml-8 -mb-8 group-hover:scale-125 transition-transform duration-700 delay-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
