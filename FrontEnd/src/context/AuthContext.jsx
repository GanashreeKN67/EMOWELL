import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "../services/apiClient";

const AuthContext = createContext(undefined);
const TOKEN_KEY = "emowell_token";
const USER_KEY = "emowell_user";

const readStoredJson = (key) => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to parse ${key} from storage`, error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredJson(USER_KEY));
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(TOKEN_KEY);
  });
  const [isChecking, setIsChecking] = useState(true);
  const [authError, setAuthError] = useState(null);

  const persistState = useCallback((nextToken, nextUser) => {
    if (typeof window === "undefined") {
      return;
    }
    if (nextToken) {
      window.localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    if (nextUser) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      setAuthError(null);
      const payload = await loginUser(credentials);
      setToken(payload.access_token);
      setUser(payload.user);
      persistState(payload.access_token, payload.user);
      return payload.user;
    },
    [persistState]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistState(null, null);
  }, [persistState]);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setIsChecking(false);
        return;
      }
      try {
        const payload = await fetchCurrentUser();
        setUser(payload.user);
      } catch (error) {
        console.warn("Unable to hydrate auth state", error);
        logout();
      } finally {
        setIsChecking(false);
      }
    };

    hydrate();
  }, [logout, token]);

  const register = useCallback(async (formValues) => {
    setAuthError(null);
    return registerUser(formValues);
  }, []);

  const refreshUser = useCallback(async () => {
    const payload = await fetchCurrentUser();
    setUser(payload.user);
    persistState(token, payload.user);
    return payload.user;
  }, [persistState, token]);

  const value = useMemo(
    () => ({
      user,
      token,
      authError,
      setAuthError,
      isAuthenticated: Boolean(user && token),
      isChecking,
      login,
      logout,
      register,
      refreshUser,
    }),
    [authError, isChecking, login, logout, register, refreshUser, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
