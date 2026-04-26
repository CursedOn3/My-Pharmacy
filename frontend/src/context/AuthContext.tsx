import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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

const loadRole = async (userId: string): Promise<Role> => {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role as Role) ?? "user";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      if (!sessionUser) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      const role = await loadRole(sessionUser.id);
      if (active) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? "",
          name:
            (sessionUser.user_metadata?.full_name as string | undefined) ??
            fallbackName(sessionUser.email ?? ""),
          role
        });
        setLoading(false);
      }
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const role = await loadRole(sessionUser.id);
      setUser({
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name:
          (sessionUser.user_metadata?.full_name as string | undefined) ??
          fallbackName(sessionUser.email ?? ""),
        role
      });
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error || !data.user) {
      throw error ?? new Error("Login failed");
    }
    const role = await loadRole(data.user.id);
    const next: AuthUser = {
      id: data.user.id,
      email: data.user.email ?? email,
      name:
        (data.user.user_metadata?.full_name as string | undefined) ??
        fallbackName(email),
      role
    };
    setUser(next);
    return next;
  };

  const logout: AuthCtx["logout"] = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
