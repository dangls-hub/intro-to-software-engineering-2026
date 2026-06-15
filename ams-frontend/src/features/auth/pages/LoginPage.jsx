import { useState } from 'react';
import { Building2, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { login as loginApi, loginWithGoogle as loginWithGoogleApi } from '../api/authApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../store/authStore';
import { useToast } from '../../../components/ui/Toast';
import { GoogleLogin } from '@react-oauth/google';

const initialForm = { username: '', password: '' };

function LoginPage() {
  const { login } = useAuth();
  const showToast = useToast();
  const [form, setForm] = useState(initialForm);
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ── Đăng nhập bằng username/password (giữ nguyên) ──────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await loginApi(form);
      const token = res?.token || res?.accessToken;
      if (!token) throw new Error('Phản hồi đăng nhập không chứa token.');

      login({
        token,
        user: res?.user || {
          username: form.username,
          fullName: res?.fullName,
          role: res?.role,
        },
      });

      showToast('Đăng nhập thành công!', 'success');
    } catch (err) {
      const message = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Đăng nhập bằng Google ──────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const res = await loginWithGoogleApi(credentialResponse.credential);
      const token = res?.token;
      if (!token) throw new Error('Phản hồi không chứa token.');

      login({
        token,
        user: {
          username: res?.username,
          fullName: res?.fullName,
          role: res?.role,
        },
      });

      showToast('Đăng nhập bằng Google thành công!', 'success');
    } catch (err) {
      const message = err.message || 'Đăng nhập Google thất bại.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập Google bị huỷ hoặc thất bại.');
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-brand">
          <span className="brand-mark">
            <Building2 size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">BlueMoon AMS</p>
            <h1 id="login-title">Đăng nhập hệ thống</h1>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        {/* ── Nút đăng nhập Google ─────────────────────────────────────────── */}
        <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="auth-divider" role="separator">
          <span>hoặc đăng nhập bằng tài khoản</span>
        </div>

        {/* ── Form username / password (giữ nguyên) ────────────────────────── */}
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Tên đăng nhập
            <input
              autoComplete="username"
              id="login-username"
              name="username"
              onChange={updateField}
              placeholder="Nhập tên đăng nhập"
              required
              type="text"
              value={form.username}
            />
          </label>

          <label>
            Mật khẩu
            <div className="pw-field">
              <input
                autoComplete="current-password"
                id="login-password"
                name="password"
                onChange={updateField}
                placeholder="Nhập mật khẩu"
                required
                type={showPw ? 'text' : 'password'}
                value={form.password}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className="forgot-link-row">
            <Link to="/forgot-password" className="auth-link">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            className="primary-button full-width submit-mt"
            disabled={isSubmitting || isGoogleLoading}
            id="login-submit"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn size={18} aria-hidden="true" />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="auth-link">
            Đăng ký ngay
          </Link>
        </p>

        <p className="auth-security-note">
          <ShieldCheck size={14} />
          Hệ thống được bảo mật bằng JWT
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
