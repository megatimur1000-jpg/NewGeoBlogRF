import TopBar from "@/components/TopBar";
import FilterTabs from "@/components/FilterTabs";
import { TrendingUp, Clock, Star, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Heart, MessageCircle, Share2 } from "lucide-react";

const PostsPage = () => {
  const tabs = [
    { id: "trending", label: "Популярное", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "recent", label: "Новое", icon: <Clock className="w-4 h-4" /> },
    { id: "favorites", label: "Избранное", icon: <Star className="w-4 h-4" /> },
  ];

  const mockPosts = [
    {
      id: 1,
      title: "Путешествие по Алтаю",
      author: "Иван Петров",
      location: "Республика Алтай",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      likes: 234,
      comments: 45,
      tags: ["природа", "горы", "путешествия"],
    },
    {
      id: 2,
      title: "Байкал зимой: незабываемый опыт",
      author: "Мария Иванова",
      location: "Озеро Байкал",
      image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80",
      likes: 567,
      comments: 89,
      tags: ["байкал", "зима", "лед"],
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Посты" showSearch />
      <FilterTabs tabs={tabs} />
      
      <div className="flex-1 overflow-y-auto pb-bottom-nav bg-background">
        <div className="p-4 space-y-4">
          {mockPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {/* Post Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-secondary text-secondary-foreground shadow-md">
                    <MapPin className="w-3 h-3 mr-1" />
                    {post.location}
                  </Badge>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {post.author}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-elevated bg-gradient-primary hover:shadow-lg transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default PostsPage;
