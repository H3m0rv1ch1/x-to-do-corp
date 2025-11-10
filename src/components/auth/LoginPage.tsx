import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { FaXTwitter } from 'react-icons/fa6';

const LoginPage: React.FC = () => {
  const { setPage, addToast } = useAppContext();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, remember);
      addToast('Welcome back!', 'success');
      setPage('home');
    } catch (err: any) {
      addToast(err?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[rgba(var(--background-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))]">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center px-6 md:px-10 gap-8 md:gap-0 min-h-screen">
        {/* Left: Giant X logo */}
        <div className="flex items-center justify-center py-20 md:py-0">
          <FaXTwitter className="w-[180px] h-[180px] md:w-[340px] md:h-[340px] text-white" />
        </div>

        {/* Right: Login form */}
        <div className="flex flex-col justify-center md:pl-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">Happening now</h1>
          <h2 className="text-xl font-semibold mb-5">Sign in to X To-Do Corp.</h2>

          <form onSubmit={handleSubmit} className="space-y-3 max-w-[340px]">
            <div>
              <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Phone, email, or username"
                className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <label className="flex items-center gap-2 text-sm text-[rgba(var(--foreground-secondary-rgb))]">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Remember me
            </label>
          </form>

          <div className="mt-8 max-w-[340px]">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full rounded-full border border-[rgba(var(--border-primary-rgb))] py-3 px-4 font-semibold hover:bg-[rgba(var(--background-secondary-rgb))] transition"
                onClick={() => setPage('signup')}
              >
                Create account
              </button>
            </div>
            <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))] leading-relaxed mt-2">
              By signing in, you agree to the Terms of Service and Privacy Policy.
            </p>
          </div>

          <div className="flex flex-col items-start mt-4 gap-3 max-w-[340px]">
            <button onClick={() => setPage('forgot')} className="w-full rounded-full border border-[rgba(var(--border-primary-rgb))] py-2 font-semibold hover:bg-[rgba(var(--background-primary-rgb))] transition">
              Forgot password?
            </button>
            <div className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">
              Don't have an account?{' '}
              <button onClick={() => setPage('signup')} className="text-[rgba(var(--accent-rgb))] hover:underline">Sign up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;