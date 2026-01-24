'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';
import { toast } from 'sonner';
import { getAllUsers } from '@/lib/api';
import { getUsername } from '@/lib/auth';
import type { UserResponse } from '@/types';
import { UserList } from '@/components/admin/UserList';
import { UserDialog } from '@/components/admin/UserDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from 'shadcn/alert';
import { useTranslations } from 'next-intl';

export default function UsersPage() {
    const t = useTranslations('admin.users');
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | undefined>();

    useEffect(() => {
        const username = getUsername();
        if (username && users.length > 0) {
            const currentUser = users.find((u) => u.username === username);
            if (currentUser) {
                setCurrentUserId(currentUser.id);
            }
        }
    }, [users]);

    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch {
            setError(t('../../admin.messages.loadUsersFailed'));
            toast.error(t('../../admin.messages.loadUsersFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (user: UserResponse) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleDelete = (user: UserResponse) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const handleDialogSuccess = () => {
        loadUsers();
    };

    const handleDeleteSuccess = () => {
        loadUsers();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('../../common.status.error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">{t('registeredInSystem')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('administrators')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter((u) => u.roles.includes('ROLE_ADMIN')).length}</div>
                        <p className="text-xs text-muted-foreground">{t('withAdminPrivileges')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('assignedUsers')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter((u) => u.organisationId).length}</div>
                        <p className="text-xs text-muted-foreground">{t('withOrganisationAssignment')}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('allUsers')}</CardTitle>
                    <CardDescription>{t('allUsersDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserList users={users} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} currentUserId={currentUserId} />
                </CardContent>
            </Card>

            <UserDialog user={selectedUser} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={handleDialogSuccess} />

            <DeleteUserDialog user={userToDelete} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onSuccess={handleDeleteSuccess} currentUserId={currentUserId} />
        </div>
    );
}
