'use server'

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSiteUrl(origin: string | null) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? origin ?? "http://localhost:3000";
}

export async function signInWithNotion() {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const siteUrl = getSiteUrl(requestHeaders.get("origin"));
  const callbackUrl = new URL("/auth/callback", siteUrl);
  callbackUrl.searchParams.set("next", "/dashboard");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "notion",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_start");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
