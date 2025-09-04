"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  Shield, 
  Ban, 
  RefreshCcw 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "@/lib/schemas/user";
import { 
  USER_ROLE_LABELS, 
  USER_STATUS_LABELS, 
  USER_ROLE_BADGE_VARIANTS, 
  USER_STATUS_BADGE_VARIANTS 
} from "@/lib/constants/user";

interface UserActionsProps {
  user: User;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onResetPassword: (id: string) => void;
}

const UserActions = ({ user, onDelete, onToggleStatus, onResetPassword }: UserActionsProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(user.id);
    setShowDeleteDialog(false);
  };

  const handleToggleStatus = () => {
    onToggleStatus(user.id);
  };

  const handleResetPassword = () => {
    onResetPassword(user.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/users/${user.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {user.status === 'ACTIVE' ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Enable
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResetPassword}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{" "}
              <strong>{user.name}</strong> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const createUserColumns = (
  onDelete: (id: string) => void,
  onToggleStatus: (id: string) => void,
  onResetPassword: (id: string) => void
) => {
  return [
    {
      header: "Name",
      cell: (user: User) => (
        <div className="font-medium">{user.name}</div>
      ),
    },
    {
      header: "Email",
      cell: (user: User) => (
        <div className="text-muted-foreground">{user.email}</div>
      ),
    },
    {
      header: "Role",
      cell: (user: User) => (
        <Badge variant={USER_ROLE_BADGE_VARIANTS[user.role]}>
          {USER_ROLE_LABELS[user.role]}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (user: User) => (
        <Badge variant={USER_STATUS_BADGE_VARIANTS[user.status]}>
          {USER_STATUS_LABELS[user.status]}
        </Badge>
      ),
    },
    {
      header: "Created",
      cell: (user: User) => (
        <div className="text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (user: User) => (
        <UserActions
          user={user}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onResetPassword={onResetPassword}
        />
      ),
    },
  ];
};
