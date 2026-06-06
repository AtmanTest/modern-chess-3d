// ── Next.js app loader for custom server ──

// We use dynamic import so the custom server can bootstrap Next.js
// without a separate build step conflict.
import next from 'next';

const nextApp = next({
  dev: process.env.NODE_ENV !== 'production',
  hostname: 'localhost',
  port: parseInt(process.env.PORT || '3000', 10),
});

export default nextApp;
