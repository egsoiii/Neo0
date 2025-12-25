import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">404 Page Not Found</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved to another URL.
        </p>
        <Link href="/">
          <Button size="lg" className="retro-shadow retro-shadow-hover transition-all">
            Return Home
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
