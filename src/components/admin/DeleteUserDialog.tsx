'use client';

import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { deleteUser } from '@/lib/api';
import type { UserResponse } from '@/types';
import { Loader2 } from 'lucide-react';

interface DeleteUserDialogProps {
  user: UserResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentUserId?: number;
}

export function DeleteUserDialog({ user, open, onOpenChange, onSuccess, currentUserId }: DeleteUserDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!user) { return; }

        // Prevent deletion of current user
        if (currentUserId && user.id === currentUserId) {
            toast.error('Cannot delete your own account');
            return;
        }

        setIsDeleting(true);
        try {
            await deleteUser(user.id);
            toast.success(`User "${user.username}" has been deleted`);
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) { return null; }

    const isSelf = currentUserId && user.id === currentUserId;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                        {isSelf ? (
                            <span className="text-destructive font-medium">You cannot delete your own account.</span>
                        ) : (
                            <>
                Are you sure you want to delete user <span className="font-semibold">{user.username}</span>?
                                <br />
                                <br />
                This action cannot be undone. All data associated with this user will be permanently removed from the system.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    {!isSelf && (
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                                </>
                            ) : (
                                'Delete User'
                            )}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
