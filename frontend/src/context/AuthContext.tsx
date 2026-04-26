import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "user" | "admin";
export type AuthUser = {
  email: string;
  name: string;
  role: Role;
};

type AuthCtx = {
  user: AuthUser | null;
  login: (email: string, password: string) => AuthUser;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "medicare.auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    if (typeof window === "undefined") return;
    if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const login: AuthCtx["login"] = (email, _password) => {
    // Mock: any email containing "admin" becomes an admin
    const role: Role = email.toLowerCase().includes("admin") ? "admin" : "user";
    const name = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim() || "Guest";
    const next: AuthUser = {
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      role,
    };
    setUser(next);
    persist(next);
    return next;
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
