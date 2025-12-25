import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut, LayoutGrid, Globe, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth();
  const [location] = useLocation();

  const isAuthPage = location === "/login" || location === "/register";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl retro-shadow group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              M
            </div>
            <span className="font-display font-bold text-xl tracking-tight">minicities</span>
          </Link>

          <nav className="flex items-center gap-4">
            {!user ? (
              !isAuthPage && (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="font-medium">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-bold retro-shadow retro-shadow-hover transition-all">Get Started</Button>
                  </Link>
                </>
              )
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="gap-2"
                >
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Sign Out
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>
        {children}
      </main>

      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-display font-bold text-lg">minicities</span>
            <p className="text-sm text-muted-foreground">Build your corner of the web.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
