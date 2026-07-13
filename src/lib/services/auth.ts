"use client";

import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/db";

export interface SignUpInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

/** Map a Supabase auth user + profile row into our AuthUser shape.
 *  If the profile doesn't exist yet (trigger missed), auto-create it. */
async function mapAuthUser(authUserId: string): Promise<AuthUser | null> {
  if (!IS_SUPABASE_CONFIGURED) return null;
  try {
    // 1. Try to read the profile
    let { data: p, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUserId)
      .maybeSingle();

    // 2. If profile doesn't exist, try to create it
    if (!p && !error) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { data: newProfile, error: insertErr } = await supabase
          .from("profiles")
          .insert({
            id: authUserId,
            email: authData.user.email || "",
            full_name: authData.user.user_metadata?.full_name || null,
          })
          .select("*")
          .single();
        if (!insertErr && newProfile) p = newProfile;
      }
    }

    if (error || !p) return null;
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      role: p.role,
      is_guest: p.is_guest,
    };
  } catch {
    return null;
  }
}

export async function signUp({ email, password, fullName }: SignUpInput) {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error("Supabase not configured. Run the SQL migration and set env vars.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName ?? "" },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }: SignInInput) {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error("Supabase not configured. Run the SQL migration and set env vars.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!IS_SUPABASE_CONFIGURED) return;
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error("Supabase not configured.");
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
  });
  if (error) throw error;
}

export async function updateProfile(updates: {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  locale?: string;
  theme?: string;
}) {
  if (!IS_SUPABASE_CONFIGURED) return;
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", authUser.user.id);
  if (error) throw error;
}

/** Subscribe to auth state changes — returns the mapped AuthUser. */
export function onAuthChange(cb: (user: AuthUser | null) => void) {
  if (!IS_SUPABASE_CONFIGURED) {
    cb(null);
    return () => {};
  }
  let active = true;
  // Initial check
  supabase.auth.getSession().then(async ({ data }) => {
    if (!active) return;
    if (data.session?.user) {
      const u = await mapAuthUser(data.session.user.id);
      if (active) cb(u);
    } else {
      cb(null);
    }
  });
  // Subscribe
  const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const u = await mapAuthUser(session.user.id);
      cb(u);
    } else {
      cb(null);
    }
  });
  return () => {
    active = false;
    sub.subscription.unsubscribe();
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!IS_SUPABASE_CONFIGURED) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return mapAuthUser(data.user.id);
}
