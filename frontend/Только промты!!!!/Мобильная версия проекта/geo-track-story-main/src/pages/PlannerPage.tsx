import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PlannerPage = () => {
  const mockRoutes = [
    {
      id: 1,
      title: "Золотое кольцо России",
      duration: "7 дней",
      distance: "1200 км",
      points: 8,
      status: "planned",
    },
    {
      id: 2,
      title: "Кавказские горы",
      duration: "5 дней",
      distance: "850 км",
      points: 6,
      status: "active",
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Планировщик маршрутов" />
      
      <div className="flex-1 overflow-y-auto pb-bottom-nav bg-background">
        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-primary text-primary-foreground">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm opacity-90">Маршрутов</div>
          </Card>
          <Card className="p-4 bg-gradient-secondary text-secondary-foreground">
            <div className="text-2xl font-bold">45</div>
            <div className="text-sm opacity-90">Точек</div>
          </Card>
        </div>

        {/* Routes List */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Мои маршруты</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Все
            </Button>
          </div>

          <div className="space-y-3">
            {mockRoutes.map((route) => (
              <Card key={route.id} className="p-4 shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-foreground flex-1">
                    {route.title}
                  </h3>
                  <Badge
                    variant={route.status === "active" ? "default" : "outline"}
                    className={route.status === "active" ? "bg-secondary" : ""}
                  >
                    {route.status === "active" ? "Активный" : "Запланирован"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{route.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{route.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{route.points} точек</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    Изменить
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary">
                    Открыть
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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

export default PlannerPage;
