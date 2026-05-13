import { useState } from 'react';
import { Building2, LogIn } from 'lucide-react';
import { login } from '../api/authApi';

const initialForm = {
  username: '',
  password: '',
};

function LoginPage({ onLogin }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const authPayload = await login(form);
      const token = authPayload?.token || authPayload?.accessToken;

      if (!token) {
        throw new Error('Login response does not include a token.');
      }

      onLogin({
        token,
        user: authPayload?.user || {
          username: form.username,
          fullName: authPayload?.fullName,
          role: authPayload?.role,
        },
      });
    } catch (apiError) {
      setError(apiError.message || 'Dang nhap that bai.');
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
            <h1 id="login-title">Dang nhap he thong</h1>
          </div>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Ten dang nhap
            <input
              autoComplete="username"
              name="username"
              onChange={updateField}
              required
              type="text"
              value={form.username}
            />
          </label>

          <label>
            Mat khau
            <input
              autoComplete="current-password"
              name="password"
              onChange={updateField}
              required
              type="password"
              value={form.password}
            />
          </label>

          <button className="primary-button full-width" disabled={isSubmitting} type="submit">
            <LogIn size={18} aria-hidden="true" />
            {isSubmitting ? 'Dang dang nhap...' : 'Dang nhap'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
