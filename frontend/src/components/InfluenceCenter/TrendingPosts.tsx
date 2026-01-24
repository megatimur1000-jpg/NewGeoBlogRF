import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Flame, Heart, MessageCircle, Share2, Bookmark, MapPin, Navigation, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import user1 from "../../assets/assets/avatars/user-1.jpg";
import user2 from "../../assets/assets/avatars/user-2.jpg";
import user3 from "../../assets/assets/avatars/user-3.jpg";

const posts = [
  {
    id: 1,
    author: "Анна Петрова",
    avatar: user1,
    title: "Скрытые жемчужины Кавказа: 5 мест, которые стоит посетить",
    excerpt: "Открыл для себя удивительные места в горах Кавказа. Водопады, древние крепости и потрясающие виды...",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
    category: "Путешествия",
    categoryIcon: MapPin,
    categoryColor: "text-blue-500",
    likes: 1247,
    comments: 89,
    shares: 156,
    timeAgo: "2 часа назад",
    trending: true,
    badges: ["Популярное", "Редакторский выбор"]
  },
  {
    id: 2,
    author: "Михаил Соколов",
    avatar: user2,
    title: "Маршрут выходного дня: Золотое кольцо за 2 дня",
    excerpt: "Спланировал идеальный маршрут по Золотому кольцу. Все основные достопримечательности за выходные...",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
    category: "Маршруты",
    categoryIcon: Navigation,
    categoryColor: "text-green-500",
    likes: 892,
    comments: 67,
    shares: 98,
    timeAgo: "4 часа назад",
    trending: false,
    badges: ["Проверенный маршрут"]
  },
  {
    id: 3,
    author: "Елена Козлова",
    avatar: user3,
    title: "Фестиваль северного сияния в Мурманске",
    excerpt: "Незабываемые впечатления от фестиваля! Организовали групповую поездку на 20 человек...",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=200&fit=crop",
    category: "События",
    categoryIcon: Calendar,
    categoryColor: "text-purple-500",
    likes: 2156,
    comments: 134,
    shares: 287,
    timeAgo: "6 часов назад",
    trending: true,
    badges: ["Топ событие", "Групповая поездка"]
  }
];

export function TrendingPosts() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-orange-500/10 to-pink-500/10">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-gray-900">Трендовые публикации</div>
            <div className="text-sm text-gray-500 font-normal">Самые обсуждаемые посты сообщества</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {posts.map((post, index) => (
          <article 
            key={post.id}
            className="group cursor-pointer bg-white/50 hover:bg-white/80 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
                <img 
                  src={post.avatar} 
                  alt={post.author}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-bold text-gray-900">{post.author}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{post.timeAgo}</span>
                  {post.trending && (
                    <Badge className="text-xs bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                      <Flame className="w-3 h-3 mr-1" />
                      Тренд
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className={`text-xs ${post.categoryColor} border-2`}>
                    <post.categoryIcon className="w-3 h-3 mr-1" />
                    {post.category}
                  </Badge>
                  {post.badges.map((badge, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className={`text-xs font-medium ${
                        badge === "Популярное" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        badge === "Редакторский выбор" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        badge === "Топ событие" ? "bg-purple-100 text-purple-700 border-purple-200" :
                        badge === "Групповая поездка" ? "bg-green-100 text-green-700 border-green-200" :
                        badge === "Проверенный маршрут" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors font-medium">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors font-medium">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors font-medium">
                    <Share2 className="w-4 h-4" />
                    {post.shares}
                  </button>
                  <button className="flex items-center gap-2 hover:text-yellow-500 transition-colors ml-auto font-medium">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          </article>
        ))}
        
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full">
            Показать все публикации
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}