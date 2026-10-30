import { NextResponse, type NextRequest } from "next/server";
import { upsertIntegration } from "@/lib/integrations/repository";
import { encryptCredential } from "@/lib/security/credentials";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data.session?.provider_token) {
        try {
          await upsertIntegration(data.session.user.id, {
            notion_access_token_ciphertext: encryptCredential(data.session.provider_token),
          });
        } catch (tokenError) {
          console.error("Unable to store the Notion access token", tokenError);
          return NextResponse.redirect(new URL("/dashboard?error=notion_connection", request.url));
        }
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth_callback", request.url));
}
