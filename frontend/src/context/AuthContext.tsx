import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export type Role = "user" | "admin";
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

const fallbackName = (email: string) => {
  const name = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim();
  const pretty = name || "Guest";
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
};

/**
 * Loads the user's role from Supabase app_metadata first (zero extra DB call),
 * then falls back to the profiles table for backward compatibility.
 */
const resolveRole = async (supabaseUser: { id: string; app_metadata?: Record<string, unknown> }): Promise<Role> => {
  const metaRole = supabaseUser.app_metadata?.role as string | undefined;
  if (metaRole === "admin" || metaRole === "user") return metaRole;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", supabaseUser.id)
    .single();
  return (data?.role as Role) ?? "user";
};

const buildAuthUser = async (
  supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  }
): Promise<AuthUser> => {
  const role = await resolveRole(supabaseUser);
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name:
      (supabaseUser.user_metadata?.full_name as string | undefined) ??
      fallbackName(supabaseUser.email ?? ""),
    role,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Tracks the last user ID we've built an AuthUser for to avoid duplicate
  // resolveRole calls when both syncSession and onAuthStateChange fire on mount.
  const resolvedIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sessionUser = session?.user ?? null;

      if (!sessionUser) {
        resolvedIdRef.current = null;
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (event === "TOKEN_REFRESHED" && resolvedIdRef.current === sessionUser.id) {
        if (active) setLoading(false);
        return;
      }

      if (resolvedIdRef.current === sessionUser.id) {
        if (active) setLoading(false);
        return;
      }

      resolvedIdRef.current = sessionUser.id;
      const authUser = await buildAuthUser(sessionUser);
      if (active) {
        setUser(authUser);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      if (!active) return;
      if (!sessionUser) {
        setLoading(false);
        return;
      }
      if (resolvedIdRef.current === sessionUser.id) {
        setLoading(false);
        return;
      }
      resolvedIdRef.current = sessionUser.id;
      const authUser = await buildAuthUser(sessionUser);
      if (active) {
        setUser(authUser);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login: AuthCtx["login"] = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error || !data.user) {
      throw error ?? new Error("Login failed");
    }
    // signInWithPassword fires onAuthStateChange; mark the ID so the listener
    // skips a duplicate buildAuthUser call.
    resolvedIdRef.current = data.user.id;
    const authUser = await buildAuthUser(data.user);
    setUser(authUser);
    return authUser;
  }, []);

  const logout: AuthCtx["logout"] = useCallback(async () => {
    await supabase.auth.signOut();
    resolvedIdRef.current = null;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
