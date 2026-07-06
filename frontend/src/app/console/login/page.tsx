import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin Sign In" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen hero-gradient texture-overlay flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-sm shadow-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-display text-xl">
              C
            </span>
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
