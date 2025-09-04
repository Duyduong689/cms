"use client";

import { AuthCard } from "@/components/app/auth/auth-card";
import { ForgotPasswordForm } from "@/components/app/auth/forgot-password-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthCard
          title="Reset Password"
          description="Enter your email address and we'll send you a link to reset your password."
        >
          <ForgotPasswordForm />
        </AuthCard>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-primary">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
