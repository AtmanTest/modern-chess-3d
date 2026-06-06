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
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }

        if (data.requireLogin) {
          // User created but couldn't auto-sign-in
          router.push('/login?registered=true');
          router.refresh();
          return;
        }

        // Set the session from server response
        if (data.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } catch {
        setError('Network error. Please try again.');
        setLoading(false);
      }
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

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-green-400 font-semibold">Compte créé !</p>
            <p className="text-gray-500 text-sm mt-1">Redirection...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
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
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
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
        )}

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
