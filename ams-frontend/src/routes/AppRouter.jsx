/**
 * AppRouter — Cấu hình routing trung tâm cho ứng dụng BlueMoon AMS.
 *
 * Bao gồm:
 * - PrivateRoute: bảo vệ route yêu cầu đăng nhập
 * - PublicRoute: chuyển hướng user đã login về trang chính
 * - Route phân quyền theo role (ADMIN, STAFF, RESIDENT)
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * Bọc route cần xác thực.
 * Nếu chưa đăng nhập, redirect về /login.
 * Nếu có roles, kiểm tra user có role phù hợp.
 */
export function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = user?.role || '';
    if (!roles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

/**
 * Bọc route công khai (login, register).
 * Nếu đã đăng nhập, redirect về trang chính.
 */
export function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
