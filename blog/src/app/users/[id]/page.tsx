"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-users";
import { ArrowLeft, Edit, Shield, Ban, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToggleUserStatus, useResetUserPassword } from "@/hooks/use-users";
import { 
  USER_ROLE_LABELS, 
  USER_STATUS_LABELS, 
  USER_ROLE_BADGE_VARIANTS, 
  USER_STATUS_BADGE_VARIANTS 
} from "@/lib/constants/user";

export default function UserView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: user, isLoading } = useUser(params.id);
  const toggleUserStatus = useToggleUserStatus();
  const resetUserPassword = useResetUserPassword();

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      await toggleUserStatus.mutateAsync(user.id);
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      await resetUserPassword.mutateAsync(user.id);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/users/${user.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToggleStatus}
            disabled={toggleUserStatus.isPending}
          >
            {user.status === 'ACTIVE' ? (
              <>
                <Ban className="w-4 h-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Enable
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleResetPassword}
            disabled={resetUserPassword.isPending}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.avatarUrl && (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <h1 className="text-3xl font-bold">{user.name}</h1>
            </div>
            <div className="flex gap-2">
              <Badge variant={USER_ROLE_BADGE_VARIANTS[user.role]}>
                {USER_ROLE_LABELS[user.role]}
              </Badge>
              <Badge variant={USER_STATUS_BADGE_VARIANTS[user.status]}>
                {USER_STATUS_LABELS[user.status]}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm text-muted-foreground">Email</div>
                <div className="text-lg">{user.email}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground">Role</div>
                <div className="text-lg">{USER_ROLE_LABELS[user.role]}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm text-muted-foreground">Status</div>
                <div className="text-lg">{USER_STATUS_LABELS[user.status]}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground">Created</div>
                <div className="text-lg">{new Date(user.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground">Last Updated</div>
                <div className="text-lg">{new Date(user.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
