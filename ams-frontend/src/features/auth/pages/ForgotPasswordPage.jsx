import { useState } from 'react';
import { Building2, KeyRound, Mail, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { forgotPassword, resetPassword } from '../api/authApi';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  // Step 1: nhập email, Step 2: nhập token + mật khẩu mới, Step 3: thành công
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleRequestToken(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = await forgotPassword(email);
      // Demo mode: hiển thị token trực tiếp
      setDemoToken(data?.resetToken || '');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(resetToken, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 3: Thành công
  if (step === 3) {
    return (
      <main className="auth-screen">
        <section className="auth-panel" aria-labelledby="reset-success-title">
          <div className="auth-brand">
            <span className="brand-mark">
              <CheckCircle size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">BlueMoon AMS</p>
              <h1 id="reset-success-title">Đặt lại thành công!</h1>
            </div>
          </div>

          <div className="alert success">
            Mật khẩu đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.
          </div>

          <Link to="/login" className="primary-button full-width" style={{ marginTop: 8, textDecoration: 'none', textAlign: 'center' }}>
            <ArrowLeft size={18} aria-hidden="true" />
            Đi đến trang đăng nhập
          </Link>
        </section>
      </main>
    );
  }

  // Step 2: Nhập token + mật khẩu mới
  if (step === 2) {
    return (
      <main className="auth-screen">
        <section className="auth-panel" aria-labelledby="reset-title">
          <div className="auth-brand">
            <span className="brand-mark">
              <ShieldCheck size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">BlueMoon AMS</p>
              <h1 id="reset-title">Đặt lại mật khẩu</h1>
            </div>
          </div>

          {demoToken && (
            <div className="alert success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <strong>🔑 Mã xác nhận (Demo):</strong>
              <code style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: 800 }}>{demoToken}</code>
              <small style={{ opacity: 0.8 }}>Trong production, mã này sẽ được gửi qua email.</small>
            </div>
          )}

          {error && <div className="alert error">{error}</div>}

          <form className="form-grid" onSubmit={handleResetPassword}>
            <label>
              Mã xác nhận
              <input
                id="reset-token"
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Nhập mã xác nhận"
                required
                type="text"
                value={resetToken}
              />
            </label>

            <label>
              Mật khẩu mới
              <input
                autoComplete="new-password"
                id="reset-new-password"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                required
                type="password"
                value={newPassword}
              />
            </label>

            <label>
              Xác nhận mật khẩu mới
              <input
                autoComplete="new-password"
                id="reset-confirm-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                type="password"
                value={confirmPassword}
              />
            </label>

            <button
              className="primary-button full-width"
              disabled={isSubmitting}
              id="reset-submit"
              type="submit"
              style={{ marginTop: 8 }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <KeyRound size={18} aria-hidden="true" />
                  Đặt lại mật khẩu
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            <Link to="/login" className="auth-link">
              <ArrowLeft size={14} style={{ verticalAlign: '-2px' }} /> Quay lại đăng nhập
            </Link>
          </p>
        </section>
      </main>
    );
  }

  // Step 1: Nhập email
  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="forgot-title">
        <div className="auth-brand">
          <span className="brand-mark">
            <Building2 size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">BlueMoon AMS</p>
            <h1 id="forgot-title">Quên mật khẩu</h1>
          </div>
        </div>

        <p className="muted-text" style={{ marginBottom: 20, fontSize: '0.9rem' }}>
          Nhập email đã đăng ký để nhận mã đặt lại mật khẩu.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form className="form-grid" onSubmit={handleRequestToken}>
          <label>
            Email
            <input
              autoComplete="email"
              id="forgot-email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <button
            className="primary-button full-width"
            disabled={isSubmitting}
            id="forgot-submit"
            type="submit"
            style={{ marginTop: 8 }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Đang gửi...
              </>
            ) : (
              <>
                <Mail size={18} aria-hidden="true" />
                Gửi mã xác nhận
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="auth-link">
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
