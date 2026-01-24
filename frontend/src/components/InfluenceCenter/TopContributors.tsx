import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Trophy, TrendingUp, Star, MapPin, Navigation, BookOpen, Calendar } from "lucide-react";
import user1 from "../../assets/assets/avatars/user-1.jpg";
import user2 from "../../assets/assets/avatars/user-2.jpg";
import user3 from "../../assets/assets/avatars/user-3.jpg";
import user4 from "../../assets/assets/avatars/user-4.jpg";
import user5 from "../../assets/assets/avatars/user-5.jpg";

const contributors = [
  {
    rank: 1,
    name: "Анна Петрова",
    avatar: user1,
    points: 2847,
    level: "Легенда",
    category: "Картограф",
    achievements: ["Первопроходец", "Эксперт региона", "100+ маркеров"],
    change: "+12%",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: MapPin
  },
  {
    rank: 2,
    name: "Михаил Соколов",
    avatar: user2,
    points: 2156,
    level: "Эксперт",
    category: "Планировщик",
    achievements: ["50+ маршрутов", "Мастер планирования"],
    change: "+8%",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    icon: Navigation
  },
  {
    rank: 3,
    name: "Елена Козлова",
    avatar: user3,
    points: 1923,
    level: "Эксперт",
    category: "Блогер",
    achievements: ["20+ блогов", "Популярный автор"],
    change: "+15%",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    icon: BookOpen
  },
  {
    rank: 4,
    name: "Дмитрий Волков",
    avatar: user4,
    points: 1654,
    level: "Исследователь",
    category: "Событийщик",
    achievements: ["10+ событий", "Организатор"],
    change: "+5%",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: Calendar
  },
  {
    rank: 5,
    name: "Ольга Морозова",
    avatar: user5,
    points: 1423,
    level: "Исследователь",
    category: "Картограф",
    achievements: ["25+ маркеров", "Новичок"],
    change: "+22%",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: MapPin
  }
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
  if (rank === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
  if (rank === 3) return <Trophy className="w-4 h-4 text-orange-500" />;
  return <span className="w-4 h-4 text-center text-xs font-bold text-muted-foreground">{rank}</span>;
};

export function TopContributors() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-gray-900">Топ исследователей</div>
            <div className="text-sm text-gray-500 font-normal">Самые активные участники сообщества</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {contributors.map((contributor, index) => (
          <div 
            key={contributor.name}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 hover:bg-white/80 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg">
              {getRankIcon(contributor.rank)}
            </div>
            
            <div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
              <img 
                src={contributor.avatar} 
                alt={contributor.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-gray-900 truncate">{contributor.name}</h4>
                <Badge 
                  variant="secondary" 
                  className={`text-xs font-medium ${
                    contributor.level === "Легенда" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                    contributor.level === "Эксперт" ? "bg-purple-100 text-purple-700 border-purple-200" :
                    contributor.level === "Исследователь" ? "bg-blue-100 text-blue-700 border-blue-200" :
                    "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {contributor.level}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <contributor.icon className={`w-4 h-4 ${contributor.color}`} />
                  <span className="text-sm text-gray-600 font-medium">{contributor.category}</span>
                </div>
                <div className="text-sm font-bold text-gray-900">{contributor.points.toLocaleString()} очков</div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {contributor.achievements.slice(0, 2).map((achievement, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className={`text-xs font-medium ${
                      achievement.includes("100+") ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                      achievement.includes("50+") ? "bg-green-50 text-green-600 border-green-200" :
                      achievement.includes("20+") ? "bg-orange-50 text-orange-600 border-orange-200" :
                      achievement.includes("10+") ? "bg-blue-50 text-blue-600 border-blue-200" :
                      achievement.includes("25+") ? "bg-cyan-50 text-cyan-600 border-cyan-200" :
                      "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              {contributor.change}
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            Показать всех участников →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}