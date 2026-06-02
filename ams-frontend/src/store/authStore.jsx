/**
 * Auth Store — Quản lý trạng thái xác thực tập trung cho ứng dụng.
 *
 * Sử dụng React Context + useReducer để cung cấp:
 * - Token JWT (lưu localStorage)
 * - Thông tin user đang đăng nhập
 * - Hàm login / logout
 * - Tự động redirect về /login khi token bị xóa
 */

import { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { getAuthToken, setAuthToken, clearAuthToken } from '../lib/apiClient';

const AUTH_USER_KEY = 'bluemoon_auth_user';

// ── Initial state ────────────────────────────────────────

function getInitialState() {
  const token = getAuthToken();
  if (!token) return { token: null, user: null, isAuthenticated: false };

  try {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    const user = saved ? JSON.parse(saved) : { username: 'staff', role: 'STAFF' };
    return { token, user, isAuthenticated: true };
  } catch {
    return { token, user: { username: 'staff', role: 'STAFF' }, isAuthenticated: true };
  }
}

// ── Reducer ──────────────────────────────────────────────

const ActionTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
};

function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN:
      return {
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
      };

    case ActionTypes.LOGOUT:
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };

    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, null, getInitialState);

  const login = useCallback((authPayload) => {
    const { token, user } = authPayload;

    // Persist to localStorage
    setAuthToken(token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user || {}));

    dispatch({
      type: ActionTypes.LOGIN,
      payload: {
        token,
        user: user || {},
      },
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem(AUTH_USER_KEY);
    dispatch({ type: ActionTypes.LOGOUT });
  }, []);

  const updateUser = useCallback((userData) => {
    const merged = { ...(state.user || {}), ...userData };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(merged));
    dispatch({ type: ActionTypes.UPDATE_USER, payload: userData });
  }, [state.user]);

  // Listen for storage changes across tabs
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === 'bluemoon_auth_token' && !e.newValue) {
        dispatch({ type: ActionTypes.LOGOUT });
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      updateUser,
    }),
    [state, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state and actions.
 * @returns {{ token: string|null, user: object|null, isAuthenticated: boolean, login: Function, logout: Function, updateUser: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
