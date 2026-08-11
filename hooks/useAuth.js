"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = (next = "/home") => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
  };

  const signUpWithEmail = async (email, password) => {
    const supabase = createClient();
    return supabase.auth.signUp({ email, password });
  };

  const signInWithEmail = async (email, password) => {
    const supabase = createClient();
    return supabase.auth.signInWithPassword({ email, password });
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return { user, loading, loginWithGoogle, signUpWithEmail, signInWithEmail, logout };
}
