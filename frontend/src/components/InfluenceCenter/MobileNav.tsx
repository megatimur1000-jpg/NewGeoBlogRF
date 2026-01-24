import { Home, Users, TrendingUp, Award, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Главная", active: true },
  { icon: TrendingUp, label: "Рейтинг", active: false },
  { icon: Users, label: "Люди", active: false },
  { icon: Award, label: "Награды", active: false },
  { icon: Heart, label: "Избранное", active: false },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
              item.active 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
