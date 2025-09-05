"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ForgotPasswordForm } from "@/components/app/auth/forgot-password-form";
import { LoginForm } from "@/components/app/auth/login-form";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const handleBackToLogin = () => {
    setShowLogin(true);
  };

  const handleForgotPassword = () => {
    setShowLogin(false);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <LoginForm onForgotPassword={handleForgotPassword} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
      </div>
    </div>
  );
}