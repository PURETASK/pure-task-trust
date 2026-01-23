import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, HelpCircle, Bell, Home, ArrowLeft } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getHomePath = () => {
    if (!isAuthenticated) return "/";
    if (user?.role === "cleaner") return "/cleaner/dashboard";
    if (user?.role === "admin") return "/admin/analytics";
    return "/dashboard";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-3 sm:px-4">
              <div className="flex items-center gap-1.5 sm:gap-3">
                <SidebarTrigger className="h-8 w-8" />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(-1)}
                  className="h-8 w-8 hidden sm:flex"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild
                  className="h-8 w-8 hidden sm:flex"
                  aria-label="Go home"
                >
                  <Link to={getHomePath()}>
                    <Home className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Link to={getHomePath()} className="flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg gradient-brand flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">P</span>
                  </div>
                  <span className="font-bold text-base sm:text-lg text-foreground">PureTask</span>
                </Link>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <ThemeToggle />
                
                {isAuthenticated && user ? (
                  <>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link to="/settings/notifications">
                        <Bell className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2">
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium hidden md:inline text-sm">{user.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <Link 
                          to={user.role === "cleaner" ? "/cleaner/profile/view" : "/profile"}
                          className="block px-2 py-1.5 hover:bg-accent rounded-sm transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                              <span className="text-xs text-primary font-medium capitalize">{user.role}</span>
                            </div>
                          </div>
                        </Link>
                        <DropdownMenuSeparator />
                        
                        {user.role === "cleaner" && (
                          <DropdownMenuItem asChild>
                            <Link to="/cleaner/profile" className="flex items-center gap-2 cursor-pointer">
                              <Settings className="h-4 w-4" />
                              Profile Settings
                            </Link>
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem asChild>
                          <Link to="/settings/notifications" className="flex items-center gap-2 cursor-pointer">
                            <Bell className="h-4 w-4" />
                            Notifications
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                          <Link to="/help" className="flex items-center gap-2 cursor-pointer">
                            <HelpCircle className="h-4 w-4" />
                            Help & Support
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleLogout}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/book">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}