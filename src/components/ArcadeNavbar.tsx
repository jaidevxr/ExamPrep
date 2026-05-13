import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, BarChart3, Bot, LogOut, User, Settings, Users, MessageSquare, FileText, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ADMIN_EMAIL = 'jaiy9956@gmail.com';

export const ArcadeNavbar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { totalUnread } = useChat();
  
  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/friends", icon: Users, label: "Buddies" },
    { path: "/planner", icon: Calendar, label: "Planner" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/chat", icon: Bot, label: "AI Chat" },
    ...(user?.email === ADMIN_EMAIL ? [
      { path: "/resources", icon: FileText, label: "Resources" },
      { path: "/admin", icon: Shield, label: "Admin" },
    ] : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm minecraft-block border-t-4 border-border">
        <nav className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const showDot = item.path === "/friends" && totalUnread > 0;
              
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={`
                        relative flex flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 font-black text-xs arcade-text
                        transition-all duration-200 border-2 flex-1
                        ${active 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:border-primary/50"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden lg:inline">{item.label.toUpperCase()}</span>
                      {showDot && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card animate-pulse" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden minecraft-block bg-card border-2 border-border">
                    <p className="font-black text-xs">{item.label.toUpperCase()}</p>
                  </TooltipContent>
                </Tooltip>
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
              <div className="border-t border-border mt-1 pt-1.5 pb-1 px-2">
                <p className="text-[9px] text-muted-foreground/50 text-center tracking-wider">
                  ✦ Crafted by <span className="font-bold text-primary/50">Jaidev</span> ✦
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
    </TooltipProvider>
  );
};
