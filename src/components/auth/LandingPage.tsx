import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { FaXTwitter } from 'react-icons/fa6';

const LandingPage: React.FC = () => {
  const { setPage, addToast } = useAppContext();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'none' | 'login' | 'signup'>('none');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  // Signup form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (signupPassword.length < 8) {
      addToast('Use at least 8 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), signupEmail.trim(), signupPassword);
      addToast('Account created!', 'success');
      setPage('home');
    } catch (err: any) {
      addToast(err?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[rgba(var(--background-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] flex flex-col">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center px-6 md:px-10 gap-8 md:gap-0 w-full flex-1">
        {/* Left: Giant X logo */}
        <div className="flex items-center justify-center py-20 md:py-0">
          <FaXTwitter className="w-[180px] h-[180px] md:w-[340px] md:h-[340px] text-white" />
        </div>

        {/* Right: Hero text and inline forms */}
        <div className="flex flex-col justify-center md:pl-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">Happening now</h1>
          {mode === 'none' && (
            <>
              <h2 className="text-xl font-semibold mb-5">Join today to X To-Do Corp.</h2>
              <div className="flex flex-col gap-3 max-w-[340px]">
                <button
                  type="button"
                  className="rounded-full bg-white text-black py-2.5 px-4 font-semibold shadow hover:opacity-90 transition w-full"
                  onClick={() => setMode('signup')}
                >
                  Create account
                </button>
                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))] leading-relaxed mt-2">
                  By signing up, you agree to the Terms of Service and Privacy Policy.
                </p>
              </div>
              <div className="mt-8 max-w-[340px]">
                <p className="font-semibold mb-3">Already have an account?</p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    className="w-full rounded-full border border-[rgba(var(--border-rgb))] py-3 px-4 font-semibold hover:bg-[rgba(var(--background-secondary-rgb))] transition"
                    onClick={() => setMode('login')}
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="max-w-[340px]">
              <h2 className="text-xl font-semibold mb-5">Sign in to X To-Do Corp.</h2>
              <form onSubmit={handleLoginSubmit} className="space-y-3">
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
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <label className="flex items-center gap-2 text-sm text-[rgba(var(--foreground-secondary-rgb))]">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button
                type="button"
                className="px-4 py-2 rounded-full border border-[rgba(var(--border-primary-rgb))]"
                onClick={() => setMode('none')}
              >
                Cancel
              </button>
            </div>
              </form>
            </div>
          )}

          {mode === 'signup' && (
            <div className="max-w-[340px]">
              <h2 className="text-xl font-semibold mb-5">Create your account</h2>
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Email</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Password</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full border border-[rgba(var(--border-primary-rgb))]"
                    onClick={() => setMode('none')}
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))] leading-relaxed mt-2">
                  By signing up, you agree to the Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
      {/* Footer links row */}
      <div className="border-t border-[rgba(var(--border-primary-rgb))]">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[rgba(var(--foreground-secondary-rgb))]">
            <a className="hover:underline" href="#">About</a>
            <a className="hover:underline" href="#">Download the X app</a>
            <a className="hover:underline" href="#">Grok</a>
            <a className="hover:underline" href="#">Help Center</a>
            <a className="hover:underline" href="#">Terms of Service</a>
            <a className="hover:underline" href="#">Privacy Policy</a>
            <a className="hover:underline" href="#">Cookie Policy</a>
            <a className="hover:underline" href="#">Accessibility</a>
            <a className="hover:underline" href="#">Ads info</a>
            <a className="hover:underline" href="#">Blog</a>
            <a className="hover:underline" href="#">Careers</a>
            <a className="hover:underline" href="#">Brand Resources</a>
            <a className="hover:underline" href="#">Advertising</a>
            <a className="hover:underline" href="#">X for Business</a>
            <a className="hover:underline" href="#">Developers</a>
            <a className="hover:underline" href="#">News</a>
            <a className="hover:underline" href="#">Settings</a>
            <span className="ml-auto">© 2025 X Corp.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;