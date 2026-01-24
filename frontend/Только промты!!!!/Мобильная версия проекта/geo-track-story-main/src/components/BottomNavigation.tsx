import { NavLink } from "./NavLink";
import { Map, FileText, User, Activity, Route } from "lucide-react";

const BottomNavigation = () => {
  const navItems = [
    { to: "/", icon: Map, label: "Карта" },
    { to: "/posts", icon: FileText, label: "Посты" },
    { to: "/planner", icon: Route, label: "Маршруты" },
    { to: "/activity", icon: Activity, label: "Активность" },
    { to: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-bottom-nav px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
