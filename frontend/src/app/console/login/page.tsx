import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { guestGet } from "@/lib/api";
import type { ChurchDetails } from "@/lib/api-types";

export const metadata: Metadata = { title: "Admin Sign In" };

export default async function AdminLoginPage() {
  const church = await guestGet<ChurchDetails>("/church/details", 600).catch(() => null);
  const churchName = church?.church_name ?? "Church";

  return (
    <div className="min-h-screen hero-gradient texture-overlay flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-sm shadow-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            {church?.church_logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={church.church_logo}
                alt={`${churchName} logo`}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-display text-xl">
                {churchName.charAt(0)}
              </span>
            )}
          </Link>
          <h1 className="font-display text-3xl text-ink">Admin Console</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Sign in to manage your church
          </p>
        </div>

        <Suspense>
          <AdminLoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link href="/" className="text-primary hover:text-primary-dark">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
