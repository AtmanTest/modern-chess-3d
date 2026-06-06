'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }, [supabase, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-sm">{error || 'Profil introuvable'}</p>
          <button onClick={() => router.push('/')} className="mt-4 text-amber-400 text-sm hover:underline">
            Retour à l&apos;accueil
          </button>
        </div>
      </main>
    );
  }

  const winRate = profile.games_played > 0
    ? Math.round((profile.wins / profile.games_played) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-amber-400">♚</span> Profil
        </h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 text-sm transition-colors"
        >
          Déconnexion
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        {/* Avatar + Name */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600
                          flex items-center justify-center text-2xl font-bold text-black mx-auto">
            {profile.username[0].toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold mt-4">{profile.username}</h2>
          <p className="text-amber-400 font-semibold text-lg mt-1">
            {profile.elo} Elo
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Parties" value={profile.games_played} />
          <StatCard label="Victoires" value={profile.wins} color="text-green-400" />
          <StatCard label="Défaites" value={profile.losses} color="text-red-400" />
          <StatCard label="Nulles" value={profile.draws} color="text-gray-400" />
          <div className="col-span-2 bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{winRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Taux de victoire</p>
          </div>
        </div>

        {/* Member since */}
        <p className="text-center text-xs text-gray-600">
          Membre depuis le {new Date(profile.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </main>
  );
}

function StatCard({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
