import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Code, Sparkles, Zap, LayoutTemplate } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // If already logged in, show a different hero action
  const handleHeroAction = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      setLocation("/register");
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent-foreground text-sm font-semibold mb-6 border border-accent/20">
                ✨ The web is fun again
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Bring back the <span className="text-primary">personal web</span>.
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Minicities is a simple HTML hosting platform for creative minds. Write code, publish instantly, and share your corner of the internet.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={handleHeroAction}
                  className="h-14 px-8 text-lg font-bold rounded-xl retro-shadow retro-shadow-hover transition-all bg-primary hover:bg-primary/90"
                >
                  {user ? "Go to Dashboard" : "Start Building Free"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-lg font-medium rounded-xl border-2 hover:bg-secondary/50"
                >
                  Explore Sites
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract shapes/decoration */}
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="w-8 h-8 text-primary" />}
              title="Pure HTML & CSS"
              description="No frameworks, no build steps. Just write code and see it live instantly."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-accent" />}
              title="Instant Deploys"
              description="Save your file and it's online. We handle the hosting, SSL, and everything else."
            />
            <FeatureCard 
              icon={<LayoutTemplate className="w-8 h-8 text-indigo-500" />}
              title="Your Own Subdomain"
              description="Get a unique URL like username.minicities.dev to share with the world."
            />
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-bold">Simple by design.</h2>
              <p className="text-lg text-muted-foreground">
                We believe the web should be accessible to everyone. You don't need a degree in computer science to build a website. Just a browser and an idea.
              </p>
              <ul className="space-y-4">
                {[
                  "Built-in code editor",
                  "Drag & drop file management",
                  "Community of creative builders",
                  "No ads, no tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex-1 w-full max-w-lg">
              <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-white/10 retro-shadow">
                <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-xs text-gray-400 font-mono">index.html</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed text-gray-300">
                  <p><span className="text-blue-400">&lt;!DOCTYPE</span> <span className="text-orange-400">html</span><span className="text-blue-400">&gt;</span></p>
                  <p><span className="text-blue-400">&lt;html&gt;</span></p>
                  <p className="pl-4"><span className="text-blue-400">&lt;body&gt;</span></p>
                  <p className="pl-8"><span className="text-blue-400">&lt;h1&gt;</span><span className="text-white">Hello World!</span><span className="text-blue-400">&lt;/h1&gt;</span></p>
                  <p className="pl-8"><span className="text-blue-400">&lt;p&gt;</span><span className="text-white">This is my first website.</span><span className="text-blue-400">&lt;/p&gt;</span></p>
                  <p className="pl-8"><span className="text-gray-500">&lt;!-- Built with Minicities --&gt;</span></p>
                  <p className="pl-4"><span className="text-blue-400">&lt;/body&gt;</span></p>
                  <p><span className="text-blue-400">&lt;/html&gt;</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-secondary/20 border border-border hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="mb-6 p-3 bg-white rounded-xl inline-flex border border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
