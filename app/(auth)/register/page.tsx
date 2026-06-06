'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Create profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from('profiles').insert({
          id: authData.user.id,
          username,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }

      router.push('/login?registered=true');
      router.refresh();
    },
    [email, password, username, supabase, router],
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            ♚ <span className="text-amber-400">Modern</span> Chess
          </h1>
          <p className="text-gray-500 text-sm mt-2">Créez votre compte</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nom d&apos;utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg
                       text-white text-sm placeholder-gray-500
                       focus:outline-none focus:border-amber-500/50 transition-colors"
          />
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
            placeholder="Mot de passe (min. 6 caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-amber-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
