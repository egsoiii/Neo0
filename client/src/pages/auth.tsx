import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";

export default function AuthPage() {
  const [location] = useLocation();
  const isRegister = location === "/register";
  const { login, register, isLoggingIn, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const formSchema = insertUserSchema.extend({
    // Add client-side specific validation if needed
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const action = isRegister ? register : login;
    action(values, {
      onSuccess: () => {
        // Redirect handled in useAuth onSuccess or by watcher
      },
    });
  }

  return (
    <Layout>
      <div className="flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md border-2 border-border shadow-xl retro-shadow">
          <CardHeader className="space-y-1 pb-8 text-center">
            <CardTitle className="text-3xl font-display font-bold">
              {isRegister ? "Create an account" : "Welcome back"}
            </CardTitle>
            <CardDescription className="text-base">
              {isRegister 
                ? "Start building your personal corner of the web" 
                : "Enter your credentials to access your dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="johndoe" 
                          {...field} 
                          className="h-12 text-lg bg-secondary/20 border-2 focus-visible:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="h-12 text-lg bg-secondary/20 border-2 focus-visible:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold mt-4"
                  disabled={isLoggingIn || isRegistering}
                >
                  {(isLoggingIn || isRegistering) && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isRegister ? "Create Account" : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center border-t bg-secondary/20 pt-6">
            <div className="text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
              <Link 
                href={isRegister ? "/login" : "/register"} 
                className="ml-1 font-bold text-primary hover:underline underline-offset-4"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
