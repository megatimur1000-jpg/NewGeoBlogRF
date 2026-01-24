import TopBar from "@/components/TopBar";
import FilterTabs from "@/components/FilterTabs";
import { MapPin, Star, Compass, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const MapPage = () => {
  const tabs = [
    { id: "all", label: "Все", icon: <MapPin className="w-4 h-4" /> },
    { id: "favorites", label: "Избранное", icon: <Star className="w-4 h-4" /> },
    { id: "nearby", label: "Рядом", icon: <Compass className="w-4 h-4" /> },
    { id: "popular", label: "Популярное", icon: <Mountain className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Карта" showSearch />
      <FilterTabs tabs={tabs} />
      
      <div className="flex-1 relative bg-muted">
        {/* Здесь будет ваша карта (Yandex Maps / Leaflet) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Интерактивная карта
            </p>
            <p className="text-sm text-muted-foreground">
              Здесь будет ваша карта с метками и маршрутами
            </p>
          </div>
        </div>

        {/* Floating Action Button */}
        <Button
          size="lg"
          className="absolute bottom-20 right-4 w-14 h-14 rounded-full shadow-elevated bg-gradient-primary hover:shadow-lg transition-all"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default MapPage;
