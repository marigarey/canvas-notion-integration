'use server'

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from 'next/navigation'
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0),
});

function contactRedirect(message: string): never {
  redirect(`/contact?error=${encodeURIComponent(message)}`);
}

export default async function sendMessage(formData: FormData) {
  const parsed = contactSchema.safeParse({
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    website: formData.get('website'),
  });

  if (!parsed.success) {
    contactRedirect("Check the form fields and try again.");
  }

  const requestHeaders = await headers();
  const source = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const fingerprintKey = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!fingerprintKey) {
    contactRedirect("The contact form is temporarily unavailable.");
  }

  const fingerprint = createHmac("sha256", fingerprintKey).update(source).digest("hex");
  const admin = createAdminClient();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recent, error: rateError } = await admin
    .from("contact_messages")
    .select("id")
    .eq("source_fingerprint", fingerprint)
    .gte("created_at", tenMinutesAgo)
    .limit(3);

  if (rateError) {
    console.error("Unable to check contact rate limit", rateError);
    contactRedirect("The contact form is temporarily unavailable.");
  }
  if ((recent?.length ?? 0) >= 3) {
    contactRedirect("Too many messages were submitted. Please try again later.");
  }

  const { error } = await admin.from("contact_messages").insert({
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    source_fingerprint: fingerprint,
  });

  if (error) {
    console.error("Unable to store contact message", error);
    contactRedirect("The message could not be sent. Please try again later.");
  }

  redirect(`/contact/sent`)
}
