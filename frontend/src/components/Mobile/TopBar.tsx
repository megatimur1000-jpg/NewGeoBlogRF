import { Bell, Search, HelpCircle, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  showSearch?: boolean;
  showHelp?: boolean;
  showSettings?: boolean;
  onSearchClick?: () => void;
  onHelpClick?: () => void;
  onSettingsClick?: () => void;
  onFavoritesClick?: () => void;
}

const TopBar = ({ 
  title, 
  showSearch = false, 
  showHelp = true,
  showSettings = false,
  onSearchClick,
  onHelpClick,
  onSettingsClick,
  onFavoritesClick
}: TopBarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const favorites = useFavorites();
  
  const favoritesCount = (favorites?.favoritePlaces?.length || 0) + 
                        (favorites?.favoriteRoutes?.length || 0) + 
                        (favorites?.favoriteEvents?.length || 0);

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-nav px-4">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>

                <div className="flex items-center gap-2">
                  {showSearch && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onSearchClick}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  )}
                  {showSettings && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onSettingsClick}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  )}
                  {showHelp && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onHelpClick}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </Button>
                  )}
                  {/* Кнопка избранного - всегда видна */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFavoritesClick}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted relative"
                  >
                    <Star className={cn("w-5 h-5", favoritesCount > 0 && "fill-yellow-500 text-yellow-500")} />
                    {favoritesCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-yellow-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {favoritesCount > 99 ? '99+' : favoritesCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-0"
          >
            <Avatar className="w-8 h-8 border-2 border-border">
              <AvatarImage src={user?.avatar_url} alt={user?.username || 'Profile'} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

