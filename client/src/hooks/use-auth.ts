import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { auth, signInWithGoogle, signOut, onAuthChange, type User as FirebaseUser } from "@/lib/firebase";

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  profileImageUrl: string | null;
}

function mapFirebaseUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email,
    name: user.displayName,
    profileImageUrl: user.photoURL,
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(mapFirebaseUser(firebaseUser));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      queryClient.clear();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    isLoggingIn,
    isLoggingOut,
  };
}
