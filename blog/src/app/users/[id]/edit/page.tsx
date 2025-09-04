"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { User } from "@/lib/schemas/user";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { USER_ROLES, USER_STATUSES, USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/lib/constants/user";

export default function UserEdit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: originalUser, isLoading } = useUser(params.id);
  const [user, setUser] = useState<User | null>(null);
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (originalUser) {
      setUser(originalUser);
    }
  }, [originalUser]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  const save = async () => {
    try {
      const { id, createdAt, updatedAt, ...data } = user;
      await updateUser.mutateAsync({ 
        id,
        ...data,
      });
      router.push(`/users/${user.id}`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={save} disabled={updateUser.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="font-semibold text-lg">Edit User</div>
          <div className="text-sm text-muted-foreground">
            Updated {new Date(user.updatedAt).toLocaleString()}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Input
            placeholder="Name"
            value={user.name}
            onChange={(e) => setUser({
              ...user,
              name: e.target.value,
            })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => setUser({ 
              ...user, 
              email: e.target.value.toLowerCase().trim() 
            })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              value={user.role} 
              onValueChange={(v) => setUser({ ...user, role: v as User["role"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={USER_ROLES.ADMIN}>{USER_ROLE_LABELS[USER_ROLES.ADMIN]}</SelectItem>
                <SelectItem value={USER_ROLES.STAFF}>{USER_ROLE_LABELS[USER_ROLES.STAFF]}</SelectItem>
                <SelectItem value={USER_ROLES.CUSTOMER}>{USER_ROLE_LABELS[USER_ROLES.CUSTOMER]}</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={user.status} 
              onValueChange={(v) => setUser({ ...user, status: v as User["status"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={USER_STATUSES.ACTIVE}>{USER_STATUS_LABELS[USER_STATUSES.ACTIVE]}</SelectItem>
                <SelectItem value={USER_STATUSES.DISABLED}>{USER_STATUS_LABELS[USER_STATUSES.DISABLED]}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
