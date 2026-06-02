import { useState } from 'react';
import { Building2, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { login as loginApi } from '../api/authApi';
import { useAuth } from '../../../store/authStore';
import { useToast } from '../../../components/ui/Toast';

const initialForm = { username: '', password: '' };

function LoginPage() {
  const { login } = useAuth();
  const showToast = useToast();
  const [form, setForm] = useState(initialForm);
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

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
            <div style={{ position: 'relative' }}>
              <input
                autoComplete="current-password"
                id="login-password"
                name="password"
                onChange={updateField}
                placeholder="Nhập mật khẩu"
                required
                type={showPw ? 'text' : 'password'}
                value={form.password}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: 6,
                  cursor: 'pointer',
                }}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            className="primary-button full-width"
            disabled={isSubmitting}
            id="login-submit"
            type="submit"
            style={{ marginTop: 4 }}
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

        <p
          className="muted-text"
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <ShieldCheck size={14} style={{ opacity: 0.6 }} />
          Hệ thống được bảo mật bằng JWT
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
