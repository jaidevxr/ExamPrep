import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, Bot } from "lucide-react";

export const ArcadeNavbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/subjects", icon: BookOpen, label: "Subjects" },
    { path: "/planner", icon: Calendar, label: "Planner" },
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
        <div className="flex items-center justify-around gap-2">
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
      </nav>
    </div>
  );
};

