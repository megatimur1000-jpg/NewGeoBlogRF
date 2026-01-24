import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, MapPin, FileText, Route, Award, TrendingUp } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Профиль" />
      
      <div className="flex-1 overflow-y-auto pb-bottom-nav bg-background">
        {/* Profile Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-hero"></div>
          <div className="px-4 pb-4">
            <div className="relative -mt-16 mb-4">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                  МИ
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Максим Иванов</h2>
                <p className="text-muted-foreground">@simakis</p>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Настройки
              </Button>
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-gradient-primary text-primary-foreground px-3 py-1">
                👑 ГеоБлоггер
              </Badge>
              <Badge variant="outline">Уровень 21</Badge>
            </div>

            <p className="text-sm text-foreground mb-4">
              Путешествую по России и делюсь своими открытиями 🗺️✨
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-1">1,234</div>
              <div className="text-sm text-muted-foreground">XP очков</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-secondary mb-1">7</div>
              <div className="text-sm text-muted-foreground">дней стрик</div>
            </Card>
          </div>

          {/* Activity Stats */}
          <Card className="p-4 mb-4">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Статистика
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">Посты</span>
                </div>
                <span className="font-bold text-foreground">156</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-sm text-foreground">Метки</span>
                </div>
                <span className="font-bold text-foreground">89</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Route className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm text-foreground">Маршруты</span>
                </div>
                <span className="font-bold text-foreground">23</span>
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-4">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Достижения
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {["🌱", "🌿", "🌳", "🏔️", "👑", "⭐", "🎯", "🔥"].map((emoji, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gradient-primary flex items-center justify-center text-2xl shadow-md"
                >
                  {emoji}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
