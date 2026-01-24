import { NavLink } from "./NavLink";
import { Map, FileText, Navigation, Activity, Calendar, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { to: "/posts", icon: FileText, label: "Посты" },
    { to: "/map", icon: Map, label: "Карта" },
    { to: "/planner", icon: Navigation, label: "Маршруты" },
    { to: "/calendar", icon: Calendar, label: "Календарь" },
    { to: "/activity", icon: Activity, label: "Активность" },
    { to: "/centre", icon: Users, label: "Влияние" },
  ];

  const isActive = (path: string) => {
    // Для главной страницы (/) показываем активным "Посты"
    if (path === '/posts' && (location.pathname === '/' || location.pathname === '/home')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom shadow-lg">
      <div className="flex justify-around items-center h-16 px-1 gap-1">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "bg-white text-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-1",
                "transition-all duration-300 rounded-xl p-2 flex flex-col items-center justify-center gap-1",
                "border border-gray-300 flex-1 max-w-[60px] min-h-[60px]",
                active && "shadow-xl -translate-y-1 border-gray-400",
                "active:scale-95"
              )}
            >
              <item.icon className={cn("w-5 h-5 text-gray-800 transition-transform", active && "scale-110")} />
              <span className="text-[9px] font-medium leading-tight text-gray-800 text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

