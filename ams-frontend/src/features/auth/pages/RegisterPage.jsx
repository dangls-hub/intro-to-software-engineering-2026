import { useState } from 'react';
import { Building2, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { register } from '../api/authApi';
import { Link } from 'react-router-dom';

const initialForm = { username: '', email: '', password: '', confirmPassword: '', fullName: '' };

function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        fullName: form.fullName,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="auth-screen">
        <section className="auth-panel" aria-labelledby="register-success-title">
          <div className="auth-brand">
            <span className="brand-mark">
              <CheckCircle size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">BlueMoon AMS</p>
              <h1 id="register-success-title">Đăng ký thành công!</h1>
            </div>
          </div>

          <div className="alert success">
            Tài khoản cư dân của bạn đã được tạo. Bạn có thể đăng nhập ngay bây giờ.
          </div>

          <Link to="/login" className="primary-button full-width" style={{ marginTop: 8, textDecoration: 'none', textAlign: 'center' }}>
            <ArrowLeft size={18} aria-hidden="true" />
            Đi đến trang đăng nhập
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="register-title">
        <div className="auth-brand">
          <span className="brand-mark">
            <Building2 size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">BlueMoon AMS</p>
            <h1 id="register-title">Đăng ký cư dân</h1>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Họ và tên
            <input
              autoComplete="name"
              id="register-fullname"
              name="fullName"
              onChange={updateField}
              placeholder="Nguyễn Văn A"
              required
              type="text"
              value={form.fullName}
            />
          </label>

          <label>
            Tên đăng nhập
            <input
              autoComplete="username"
              id="register-username"
              name="username"
              onChange={updateField}
              placeholder="nguyenvana"
              required
              type="text"
              value={form.username}
            />
          </label>

          <label>
            Email
            <input
              autoComplete="email"
              id="register-email"
              name="email"
              onChange={updateField}
              placeholder="email@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Mật khẩu
            <div style={{ position: 'relative' }}>
              <input
                autoComplete="new-password"
                id="register-password"
                name="password"
                onChange={updateField}
                placeholder="Ít nhất 6 ký tự"
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

          <label>
            Xác nhận mật khẩu
            <input
              autoComplete="new-password"
              id="register-confirm-password"
              name="confirmPassword"
              onChange={updateField}
              placeholder="Nhập lại mật khẩu"
              required
              type="password"
              value={form.confirmPassword}
            />
          </label>

          <button
            className="primary-button full-width"
            disabled={isSubmitting}
            id="register-submit"
            type="submit"
            style={{ marginTop: 8 }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Đang đăng ký...
              </>
            ) : (
              <>
                <UserPlus size={18} aria-hidden="true" />
                Đăng ký
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Đã có tài khoản?{' '}
          <Link to="/login" className="auth-link">
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
