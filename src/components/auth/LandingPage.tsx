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
  const [showPassword, setShowPassword] = useState(false);

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
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 pr-10 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--foreground-primary-rgb))] transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-[rgba(var(--foreground-primary-rgb))] cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border border-[rgba(var(--border-primary-rgb))] rounded-lg bg-[rgba(var(--background-primary-rgb))] peer-checked:bg-[rgba(var(--accent-rgb))] peer-checked:border-[rgba(var(--accent-rgb))] transition-all duration-200 flex items-center justify-center group-hover:border-[rgba(var(--border-secondary-rgb))]">
                      <svg className={`w-3.5 h-3.5 text-white ${remember ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="select-none">Remember me</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
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
          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-[12px] text-[rgba(var(--foreground-secondary-rgb))]">
            <a className="hover:underline whitespace-nowrap" href="#">About</a>
            <a className="hover:underline whitespace-nowrap" href="#">Download the X app</a>
            <a className="hover:underline whitespace-nowrap" href="#">Help Center</a>
            <a className="hover:underline whitespace-nowrap" href="#">Terms of Service</a>
            <a className="hover:underline whitespace-nowrap" href="#">Privacy Policy</a>
            <a className="hover:underline whitespace-nowrap" href="#">Cookie Policy</a>
            <a className="hover:underline whitespace-nowrap" href="#">Accessibility</a>
            <a className="hover:underline whitespace-nowrap" href="#">Ads info</a>
            <a className="hover:underline whitespace-nowrap" href="#">Blog</a>
            <a className="hover:underline whitespace-nowrap" href="#">Careers</a>
            <a className="hover:underline whitespace-nowrap" href="#">Brand Resources</a>
            <a className="hover:underline whitespace-nowrap" href="#">Advertising</a>
            <a className="hover:underline whitespace-nowrap" href="#">Developers</a>
            <a className="hover:underline whitespace-nowrap" href="#">Settings</a>
            <span className="whitespace-nowrap">© 2025 X To-Do Corp.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;