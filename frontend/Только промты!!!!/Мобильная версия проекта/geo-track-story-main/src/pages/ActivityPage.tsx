import TopBar from "@/components/TopBar";
import FilterTabs from "@/components/FilterTabs";
import { Users, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ActivityPage = () => {
  const tabs = [
    { id: "feed", label: "Лента", icon: <Users className="w-4 h-4" /> },
    { id: "trending", label: "Тренды", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "achievements", label: "Достижения", icon: <Award className="w-4 h-4" /> },
  ];

  const mockActivities = [
    {
      id: 1,
      user: "Алексей Смирнов",
      action: "создал новый пост",
      title: "Поход в горы Алтая",
      time: "2 часа назад",
      type: "post",
      avatar: "АС",
    },
    {
      id: 2,
      user: "Екатерина Волкова",
      action: "добавила метку",
      title: "Красивый водопад",
      time: "5 часов назад",
      type: "marker",
      avatar: "ЕВ",
    },
    {
      id: 3,
      user: "Дмитрий Козлов",
      action: "завершил маршрут",
      title: "Золотое кольцо",
      time: "1 день назад",
      type: "route",
      avatar: "ДК",
    },
    {
      id: 4,
      user: "Анна Петрова",
      action: "получила достижение",
      title: "🏆 Исследователь",
      time: "2 дня назад",
      type: "achievement",
      avatar: "АП",
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case "post":
        return "bg-primary/10 text-primary";
      case "marker":
        return "bg-secondary/10 text-secondary";
      case "route":
        return "bg-accent/10 text-accent";
      case "achievement":
        return "bg-gradient-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Активность" />
      <FilterTabs tabs={tabs} />
      
      <div className="flex-1 overflow-y-auto pb-bottom-nav bg-background">
        <div className="p-4 space-y-3">
          {mockActivities.map((activity) => (
            <Card key={activity.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={getActivityColor(activity.type)}>
                    {activity.avatar}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        {activity.user}
                      </span>
                      <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-foreground mb-2">
                    {activity.title}
                  </p>

                  <Badge variant="outline" className="text-xs">
                    {activity.type === "post" && "Пост"}
                    {activity.type === "marker" && "Метка"}
                    {activity.type === "route" && "Маршрут"}
                    {activity.type === "achievement" && "Достижение"}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
