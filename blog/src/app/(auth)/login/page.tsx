"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthCard } from "@/components/app/auth/auth-card";
import { LoginForm } from "@/components/app/auth/login-form";
import { RegisterForm } from "@/components/app/auth/register-form";
import { ForgotPasswordForm } from "@/components/app/auth/forgot-password-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <AuthCard
              title="Welcome back"
              description="Sign in to your account to continue"
            >
              <LoginForm onForgotPassword={() => setForgotPasswordOpen(true)} />
            </AuthCard>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <AuthCard
              title="Create account"
              description="Sign up for a new account to get started"
            >
              <RegisterForm />
            </AuthCard>
          </TabsContent>
        </Tabs>

        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <ForgotPasswordForm onBackToLogin={() => setForgotPasswordOpen(false)} />
            <div className="text-center text-sm">
              <Button
                variant="link"
                className="px-0 font-normal"
                onClick={() => setForgotPasswordOpen(false)}
              >
                Back to sign in
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            ← Back to home
          </Link>
        </div> */}
      </div>
    </div>
  );
}
