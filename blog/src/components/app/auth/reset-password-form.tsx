"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResetPassword } from "@/hooks/use-auth";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth";

interface ResetPasswordFormProps {
  token: string;
  onBackToLogin: () => void;
}

export const ResetPasswordForm = ({ token, onBackToLogin }: ResetPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate({ token, data });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        {...field}
                        disabled={resetPasswordMutation.isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={resetPasswordMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        {...field}
                        disabled={resetPasswordMutation.isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={resetPasswordMutation.isPending}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>At least 8 characters</li>
                  <li>One lowercase letter</li>
                  <li>One uppercase letter</li>
                  <li>One number</li>
                  <li>One special character</li>
                </ul>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="px-0 font-normal"
                onClick={onBackToLogin}
                disabled={resetPasswordMutation.isPending}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
