import Link from 'next/link';

const features = [
  {
    icon: '🎮',
    title: 'Plateau 3D Interactif',
    desc: 'Rendu PBR avec Three.js et React Three Fiber. Caméra orbitale, animations fluides, éclairage dynamique, thème sombre premium.',
  },
  {
    icon: '🤖',
    title: 'IA Stockfish 18',
    desc: 'Moteur Stockfish 18 avec NNUE compilé en WebAssembly. 10 niveaux de difficulté du débutant au grand maître.',
  },
  {
    icon: '🌐',
    title: 'Multijoueur Temps Réel',
    desc: 'Parties en ligne via Socket.IO. Rooms privées avec lien de partage. Validation des coups côté serveur anti-triche.',
  },
  {
    icon: '👤',
    title: 'Comptes & Profils',
    desc: 'Inscription email ou OAuth (GitHub/Google). Profil avec statistiques, historique des parties, graphique Elo.',
  },
  {
    icon: '🏆',
    title: 'Classement Elo',
    desc: 'Système de cote Elo standard (K=32). Classement global, progression dans le temps, analyse de vos parties.',
  },
  {
    icon: '⚡',
    title: 'Performant & Scalable',
    desc: 'Next.js 14, CI/CD GitHub vers Render, cron jobs de maintenance, architecture prévue pour la montée en charge.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen chess-gradient">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">♟️</span>
          <span className="font-bold text-lg tracking-tight">
            Modern<span className="text-amber-400">Chess</span>3D
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20
                       text-amber-400 rounded-lg border border-amber-500/20
                       transition-all duration-200"
          >
            S&apos;inscrire
          </Link>
        </nav>
      </header>

      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="text-7xl mb-6 animate-pulse">♟️</div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          Échecs en{' '}
          <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            3D
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-10">
          Un plateau d&apos;échecs 3D premium avec IA Stockfish,
          multijoueur temps réel, classement Elo, et rendu PBR.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/vs-ai"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black
                       font-semibold rounded-xl transition-all duration-200
                       shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40
                       text-lg"
          >
            🤖 Jouer contre l&apos;IA
          </Link>
          <Link
            href="/play"
            className="px-8 py-4 bg-white/5 hover:bg-white/10
                       border border-white/10 rounded-xl
                       transition-all duration-200 text-lg
                       backdrop-blur-sm"
          >
            🌐 Multijoueur
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="glass-panel p-8 hover:border-amber-500/20 transition-colors"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-600">
        <p>
          Modern Chess 3D &mdash; Open Source &middot; MIT License
        </p>
      </footer>
    </main>
  );
}
