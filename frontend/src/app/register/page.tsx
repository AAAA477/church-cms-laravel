import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/member/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen hero-gradient texture-overlay flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-white rounded-sm shadow-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-display text-xl">
              C
            </span>
          </Link>
          <h1 className="font-display text-3xl text-ink">Join Our Community</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Create an account to submit prayer requests, join groups, and more
          </p>
        </div>

        <RegisterForm />

        <p className="mt-8 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-dark">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
