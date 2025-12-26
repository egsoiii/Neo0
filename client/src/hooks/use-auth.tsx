import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) return null;
      
      const res = await fetch(api.auth.me.path, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
    staleTime: 0,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid username or password");
        }
        throw new Error("Login failed");
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      return api.auth.login.responses[200].parse(data);
    },
    onSuccess: (data) => {
      const { token, ...user } = data as any;
      queryClient.setQueryData([api.auth.me.path], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.username}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.auth.register.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Registration failed");
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      return api.auth.register.responses[201].parse(data);
    },
    onSuccess: (data) => {
      const { token, ...user } = data as any;
      queryClient.setQueryData([api.auth.me.path], user);
      toast({
        title: "Account created",
        description: "Welcome to your new digital home.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
      });
      if (!res.ok) throw new Error("Logout failed");
      localStorage.removeItem("auth_token");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({
        title: "Logged out",
        description: "See you next time.",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
