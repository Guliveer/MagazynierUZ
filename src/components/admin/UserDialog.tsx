'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'shadcn/dialog';
import { toast } from 'sonner';
import { createUser, updateUser } from '@/lib/api';
import type { UserResponse, AdminCreateUserRequest, AdminUpdateUserRequest } from '@/types';
import { UserForm } from './UserForm';

interface UserDialogProps {
  user?: UserResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserDialog({ user, open, onOpenChange, onSuccess }: UserDialogProps) {
    const t = useTranslations('admin.userDialog');
    const [isLoading, setIsLoading] = useState(false);

    const isEdit = !!user;

    const handleSubmit = async (data: AdminCreateUserRequest | AdminUpdateUserRequest) => {
        setIsLoading(true);
        try {
            if (isEdit && user) {
                await updateUser(user.id, data as AdminUpdateUserRequest);
                toast.success(t('userUpdated', { username: user.username }));
            } else {
                const newUser = await createUser(data as AdminCreateUserRequest);
                toast.success(t('userCreated', { username: newUser.username }));
            }
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to save user:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(isEdit ? t('updateFailed', { error: errorMessage }) : t('createFailed', { error: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogDescription>{isEdit ? 'Update user information, roles, and organisation assignment.' : 'Create a new user account with roles and organisation assignment.'}</DialogDescription>
                </DialogHeader>
                <UserForm user={user} onSubmit={handleSubmit} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}
