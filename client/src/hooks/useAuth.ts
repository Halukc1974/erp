import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<{user: any, isAuthenticated: boolean} | null>(null);

  // Immediately check localStorage on mount
  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem('auth_data');
      if (!stored) {
        setAuthState({ user: null, isAuthenticated: false });
        return;
      }
      
      try {
        const parsed = JSON.parse(stored);
        // Check if token is expired (24 hours)
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('auth_data');
          setAuthState({ user: null, isAuthenticated: false });
          return;
        }
        setAuthState({ user: parsed.user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('auth_data');
        setAuthState({ user: null, isAuthenticated: false });
      }
    };

    checkAuth();

    // Listen for storage changes (for login from other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Also use React Query for updates
  const { data: queryAuthData } = useQuery({
    queryKey: ["auth", "local"],
    queryFn: async () => {
      const stored = localStorage.getItem('auth_data');
      if (!stored) return null;
      
      try {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('auth_data');
          return null;
        }
        return parsed;
      } catch {
        localStorage.removeItem('auth_data');
        return null;
      }
    },
    retry: false,
    enabled: false, // Only run when explicitly called
  });

  const logout = () => {
    localStorage.removeItem('auth_data');
    setAuthState({ user: null, isAuthenticated: false });
    queryClient.setQueryData(["auth", "local"], null);
  };

  // Use immediate state if available, fallback to query
  const finalAuthState = authState || { user: queryAuthData?.user || null, isAuthenticated: !!queryAuthData?.user };

  return {
    user: finalAuthState.user,
    isAuthenticated: finalAuthState.isAuthenticated,
    isLoading: authState === null, // Only loading on initial mount
    logout,
  };
}
