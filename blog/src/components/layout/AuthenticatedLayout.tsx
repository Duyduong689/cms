"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useMe } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    // If user is authenticated and on auth pages, redirect to dashboard
    if (user && (pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password"))) {
      router.replace("/");
    }
    //If not authenticated and not on auth pages, redirect to login
    // else if ((isError || !user) && !pathname.startsWith("/login") && !pathname.startsWith("/forgot-password") && !pathname.startsWith("/reset-password")) {
    //   console.log("Redirecting to login");
    //   router.replace("/login");
    // }
  }, [user, isError, pathname, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on auth pages, show loading while redirecting
  if ((isError || !user) && !pathname.startsWith("/login") && !pathname.startsWith("/forgot-password") && !pathname.startsWith("/reset-password")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Don't render sidebar/topbar for auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")) {
    return <>{children}</>;
  }

  // Render authenticated layout with sidebar and topbar
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-4 md:p-6">
          <div className="mx-auto max-w-7xl w-full">
            {user ? children : (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
