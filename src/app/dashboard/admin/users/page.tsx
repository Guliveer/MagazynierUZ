'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getAllUsers } from '@/lib/api';
import { getUsername } from '@/lib/auth';
import type { UserResponse } from '@/types';
import { UserList } from '@/components/admin/UserList';
import { UserDialog } from '@/components/admin/UserDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | undefined>();

    // Get current user ID by matching username
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
        } catch (err) {
            console.error('Failed to load users:', err);
            setError('Failed to load users. Please try again.');
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
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
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground mt-2">Manage system users, roles, and organisation assignments</p>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Statistics Card */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">Registered in the system</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter((u) => u.roles.includes('ROLE_ADMIN')).length}</div>
                        <p className="text-xs text-muted-foreground">With admin privileges</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter((u) => u.organisationId).length}</div>
                        <p className="text-xs text-muted-foreground">With organisation assignment</p>
                    </CardContent>
                </Card>
            </div>

            {/* User List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage all users in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserList users={users} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} currentUserId={currentUserId} />
                </CardContent>
            </Card>

            {/* User Dialog (Create/Edit) */}
            <UserDialog user={selectedUser} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={handleDialogSuccess} />

            {/* Delete Confirmation Dialog */}
            <DeleteUserDialog user={userToDelete} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onSuccess={handleDeleteSuccess} currentUserId={currentUserId} />
        </div>
    );
}
