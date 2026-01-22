'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { UserResponse, AdminCreateUserRequest, AdminUpdateUserRequest, Warehouse } from '@/types';
import { getWarehouses } from '@/lib/api';

interface UserFormProps {
  user?: UserResponse | null;
  onSubmit: (data: AdminCreateUserRequest | AdminUpdateUserRequest) => void;
  isLoading: boolean;
}

const AVAILABLE_ROLES = [
    { value: 'ROLE_USER', label: 'User', description: 'Standard user access' },
    { value: 'ROLE_ADMIN', label: 'Admin', description: 'Full system access' },
    { value: 'ROLE_MANAGER', label: 'Manager', description: 'Warehouse management' }
];

export function UserForm({ user, onSubmit, isLoading }: UserFormProps) {
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles || ['ROLE_USER']);
    const [organisationId, setOrganisationId] = useState<string>(user?.organisationId?.toString() || '');
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loadingWarehouses, setLoadingWarehouses] = useState(false);

    const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

    // Load warehouses for organisation selection
    useEffect(() => {
        const loadWarehouses = async () => {
            setLoadingWarehouses(true);
            try {
                const data = await getWarehouses();
                setWarehouses(data);
            } catch (error) {
                console.error('Failed to load warehouses:', error);
            } finally {
                setLoadingWarehouses(false);
            }
        };
        loadWarehouses();
    }, []);

    const validateUsername = (value: string): string | undefined => {
        if (!value) {
            return 'Username is required';
        }
        if (value.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (value.length > 50) {
            return 'Username must not exceed 50 characters';
        }
        return undefined;
    };

    const validatePassword = (value: string, isEdit: boolean): string | undefined => {
        if (!isEdit && !value) {
            return 'Password is required';
        }
        if (value && value.length < 4) {
            return 'Password must be at least 4 characters';
        }
        return undefined;
    };

    const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
        if (!pwd) {
            return { strength: 0, label: '', color: '' };
        }

        let strength = 0;
        if (pwd.length >= 4) {
            strength++;
        }
        if (pwd.length >= 8) {
            strength++;
        }
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
            strength++;
        }
        if (/\d/.test(pwd)) {
            strength++;
        }
        if (/[^a-zA-Z0-9]/.test(pwd)) {
            strength++;
        }

        if (strength <= 1) {
            return { strength, label: 'Weak', color: 'text-red-500' };
        }
        if (strength <= 3) {
            return { strength, label: 'Medium', color: 'text-yellow-500' };
        }
        return { strength, label: 'Strong', color: 'text-green-500' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleRoleToggle = (role: string) => {
        setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isEdit = !!user;
        const usernameError = validateUsername(username);
        const passwordError = validatePassword(password, isEdit);

        if (usernameError || passwordError) {
            setErrors({
                username: usernameError,
                password: passwordError
            });
            return;
        }

        setErrors({});

        if (isEdit) {
            // Update user - only include changed fields
            const updateData: AdminUpdateUserRequest = {};
            if (username !== user.username) {
                updateData.username = username;
            }
            if (password) {
                updateData.password = password;
            }
            if (JSON.stringify(selectedRoles) !== JSON.stringify(user.roles)) {
                updateData.roleNames = selectedRoles;
            }
            if (organisationId !== user.organisationId?.toString()) {
                updateData.organisationId = organisationId ? parseInt(organisationId) : null;
            }
            onSubmit(updateData);
        } else {
            // Create user
            const createData: AdminCreateUserRequest = {
                username,
                password,
                roleNames: selectedRoles,
                organisationId: organisationId ? parseInt(organisationId) : undefined
            };
            onSubmit(createData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
                <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setErrors((prev) => ({ ...prev, username: undefined }));
                    }}
                    placeholder="Enter username (3-50 characters)"
                    disabled={isLoading}
                    className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.username}
                    </p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password">
          Password {!user && <span className="text-destructive">*</span>}
                    {user && <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>}
                </Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        placeholder={user ? 'Enter new password (optional)' : 'Enter password (min 4 characters)'}
                        disabled={isLoading}
                        className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                </div>
                {errors.password && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                    </p>
                )}
                {password && !errors.password && (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full transition-all ${passwordStrength.strength <= 1 ? 'bg-red-500 w-1/3' : passwordStrength.strength <= 3 ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'}`} />
                            </div>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Roles */}
            <div className="space-y-3">
                <Label>
          Roles <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-3 border rounded-lg p-4">
                    {AVAILABLE_ROLES.map((role) => (
                        <div key={role.value} className="flex items-start space-x-3">
                            <Checkbox id={role.value} checked={selectedRoles.includes(role.value)} onCheckedChange={() => handleRoleToggle(role.value)} disabled={isLoading} />
                            <div className="grid gap-1 leading-none">
                                <label htmlFor={role.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    {role.label}
                                </label>
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedRoles.length === 0 && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
            At least one role must be selected
                    </p>
                )}
            </div>

            {/* Organisation */}
            <div className="space-y-2">
                <Label htmlFor="organisation">Organisation (Optional)</Label>
                <Select value={organisationId} onValueChange={setOrganisationId} disabled={isLoading || loadingWarehouses}>
                    <SelectTrigger id="organisation">
                        <SelectValue placeholder="Select organisation (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">No Organisation</SelectItem>
                        {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {warehouse.name} ({warehouse.code})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Assign user to a specific organisation/warehouse</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={isLoading || selectedRoles.length === 0} className="min-w-[120px]">
                    {isLoading ? (
                        <>
                            <span className="mr-2">⏳</span>
                            {user ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>
                            {user ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  Update User
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create User
                                </>
                            )}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
