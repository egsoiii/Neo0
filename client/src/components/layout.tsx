import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Settings, LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  
  const isAuthPage = location.includes('/login') || location.includes('/register');
  const isDashboard = location.includes('/dashboard');
  const isSettings = location.includes('/settings');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold font-display text-primary hover:opacity-80 transition-opacity">
              Minicities
            </a>
          </Link>

          <nav className="flex items-center gap-4">
            {user && !isAuthPage ? (
              <>
                <Link href="/dashboard">
                  <a className={`font-medium transition-colors ${isDashboard ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/settings">
                  <a className={`font-medium transition-colors ${isSettings ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    Settings
                  </a>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => logout()}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : !isAuthPage ? (
              <>
                <Link href="/login">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </a>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/50 mt-24">
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          <p>Made with passion. No ads, no tracking.</p>
        </div>
      </footer>
    </div>
  );
}
