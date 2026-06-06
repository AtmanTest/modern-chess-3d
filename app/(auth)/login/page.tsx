'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleEmailLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    },
    [email, password, supabase, router],
  );

  const handleOAuthLogin = useCallback(
    async (provider: 'github' | 'google') => {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    },
    [supabase],
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            ♚ <span className="text-amber-400">Modern</span> Chess
          </h1>
          <p className="text-gray-500 text-sm mt-2">Connectez-vous pour jouer</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg
                       text-white text-sm placeholder-gray-500
                       focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg
                       text-white text-sm placeholder-gray-500
                       focus:outline-none focus:border-amber-500/50 transition-colors"
          />

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50
                       text-black font-semibold rounded-lg transition-all text-sm"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0a0a0a] px-2 text-gray-500">ou</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50
                       text-white border border-white/10 rounded-lg transition-all text-sm"
          >
            GitHub
          </button>
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50
                       text-white border border-white/10 rounded-lg transition-all text-sm"
          >
            Google
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Pas de compte ?{' '}
          <Link href="/register" className="text-amber-400 hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}
