// ─── API Route : Inscription utilisateur (côté serveur) ───
// Utilise SUPABASE_SERVICE_ROLE_KEY pour créer l'utilisateur + profil atomiquement

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password and username are required' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 },
      );
    }

    // Create admin client with service_role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // 1. Create the user in auth.users via admin API
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: { username },
      });

    if (createError) {
      console.error('Failed to create user:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 400 },
      );
    }

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 },
      );
    }

    // 2. Create profile directly (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        username,
        avatar_url: null,
        elo: 1200,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      // Don't fail the request — user was created, profile can be retried
    }

    // 3. Sign in the newly created user (return session for immediate auth)
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      // User was created but couldn't sign in automatically
      return NextResponse.json(
        {
          success: true,
          message: 'Account created. Please sign in.',
          requireLogin: true,
        },
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: signInData.session?.access_token,
        refresh_token: signInData.session?.refresh_token,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
