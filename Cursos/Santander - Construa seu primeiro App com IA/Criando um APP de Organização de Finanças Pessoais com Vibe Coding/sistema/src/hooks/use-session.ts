import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

/** Session state: `undefined` = ainda carregando (SSR/hidratação), `null` = deslogado. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    userId: session?.user.id,
    userEmail: session?.user.email,
    loading: session === undefined,
    signedIn: !!session,
  };
}

/** Redireciona para /auth quando não há sessão após a hidratação. */
export function useRequireAuth() {
  const { loading, signedIn } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !signedIn) {
      router.navigate({ to: "/auth", replace: true });
    }
  }, [loading, signedIn, router]);

  return { loading, signedIn };
}
