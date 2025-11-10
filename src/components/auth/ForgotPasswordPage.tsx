import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';

const ForgotPasswordPage: React.FC = () => {
  const { setPage, addToast } = useAppContext();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      addToast('Password reset link sent (demo).', 'success');
      setPage('login');
    } catch (err: any) {
      addToast(err?.message || 'Could not send reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(var(--background-primary-rgb))]">
      <div className="w-full max-w-sm p-6 rounded-2xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] shadow-[0_8px_30px_rgba(var(--foreground-primary-rgb),0.12)]">
        <h1 className="text-xl font-bold mb-4 text-[rgba(var(--foreground-primary-rgb))]">Reset password</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-lg border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 rounded-lg bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-semibold hover:opacity-90 disabled:opacity-60">{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <div className="flex justify-between mt-3 text-sm">
          <button onClick={() => setPage('login')} className="text-[rgba(var(--accent-rgb))] hover:underline">Back to sign in</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;