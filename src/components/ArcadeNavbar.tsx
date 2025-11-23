import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, BarChart3, Bot, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ArcadeNavbar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/subjects", icon: BookOpen, label: "Subjects" },
    { path: "/planner", icon: Calendar, label: "Planner" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/chat", icon: Bot, label: "AI Chat" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm minecraft-block border-t-4 border-border">
      <nav className="container mx-auto px-4 py-3 max-w-4xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4 py-2 font-black text-[10px] sm:text-xs arcade-text
                  transition-all duration-200 border-2 flex-1
                  ${active 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:border-primary/50"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label.toUpperCase()}</span>
              </Link>
            );
          })}
          </div>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border-2 border-border bg-muted/50 hover:bg-muted"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 minecraft-block bg-card border-2 border-border z-[100]">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground font-bold">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="font-black text-xs cursor-pointer hover:bg-muted">
                  <Settings className="mr-2 h-3 w-3" />
                  SETTINGS
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="font-black text-xs cursor-pointer hover:bg-destructive/20 hover:text-destructive"
              >
                <LogOut className="mr-2 h-3 w-3" />
                LOGOUT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
};

