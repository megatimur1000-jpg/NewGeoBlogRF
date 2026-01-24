import { Home, Users, TrendingUp, Award, Heart, Settings, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: Home, label: "Главная", active: true },
  { icon: TrendingUp, label: "Рейтинг", active: false },
  { icon: Users, label: "Сообщество", active: false },
  { icon: Award, label: "Достижения", active: false },
  { icon: Heart, label: "Избранное", active: false },
  { icon: Settings, label: "Настройки", active: false },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn("hidden lg:flex flex-col gradient-primary text-white w-20 min-h-screen", className)}>
      <div className="flex items-center justify-center h-16 border-b border-white/10">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center font-bold">
          ЦВ
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col items-center gap-2 py-6">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-xl transition-all",
              item.active 
                ? "bg-white/20 text-white hover:bg-white/30" 
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-5 h-5" />
          </Button>
        ))}
      </nav>
    </aside>
  );
}
