import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { FileManager } from "@/components/file-manager";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <FileManager />
      </div>
    </Layout>
  );
}
