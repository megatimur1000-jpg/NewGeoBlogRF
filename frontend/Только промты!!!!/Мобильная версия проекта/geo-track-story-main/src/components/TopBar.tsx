import { Bell, Menu, Search } from "lucide-react";
import { Button } from "./ui/button";

interface TopBarProps {
  title: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

const TopBar = ({ title, showSearch = false, onMenuClick }: TopBarProps) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-primary text-primary-foreground shadow-md">
      <div className="flex items-center justify-between h-nav px-4">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="text-primary-foreground hover:bg-white/20"
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
