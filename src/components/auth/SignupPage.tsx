import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const SignupPage: React.FC = () => {
  const { setPage, addToast } = useAppContext();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 8) {
      addToast('Use at least 8 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      addToast('Account created!', 'success');
      setPage('home');
    } catch (err: any) {
      addToast(err?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(var(--background-primary-rgb))] p-4">
      <div className="w-full max-w-md p-4 md:p-8 rounded-3xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] shadow-[0_20px_60px_rgba(var(--foreground-primary-rgb),0.18)]">
        <div className="flex items-center justify-center mb-4">
          <FaXTwitter className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-[rgba(var(--foreground-primary-rgb))] text-center">Create account</h1>

        {/* Social sign up buttons (UI only) */}
        <div className="flex flex-col gap-3 mb-4">
          <button type="button" className="flex items-center justify-center gap-3 rounded-full bg-white text-black py-2.5 px-4 shadow hover:opacity-90 transition">
            <FaGoogle className="w-5 h-5" />
            <span className="font-medium">Sign up with Google</span>
          </button>
          <button type="button" className="flex items-center justify-center gap-3 rounded-full bg-white text-black py-2.5 px-4 shadow hover:opacity-90 transition">
            <FaApple className="w-5 h-5" />
            <span className="font-medium">Sign up with Apple</span>
          </button>
        </div>

        <div className="flex items-center gap-2 my-3">
          <div className="h-px flex-1 bg-white/40" />
          <span className="px-2 text-sm font-semibold text-white">OR</span>
          <div className="h-px flex-1 bg-white/40" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]" />
            <p className="text-xs mt-1 text-[rgba(var(--foreground-secondary-rgb))]">Minimum 8 characters</p>
          </div>
          <div>
            <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-semibold hover:opacity-90 disabled:opacity-60">{loading ? 'Creating…' : 'Sign up'}</button>
        </form>
        <div className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <button onClick={() => setPage('login')} className="text-[rgba(var(--accent-rgb))] hover:underline">Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;