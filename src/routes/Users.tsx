import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, banUser, removeUser, sendEmail } from '../lib/api';
import type { CreateUserData, EmailData, User } from '../types/user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Users as UsersIcon, Plus, Mail, Ban, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function Users() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [emailData, setEmailData] = useState({ subject: '', message: '' });
    const [formData, setFormData] = useState<CreateUserData>({
        fullName: '',
        email: '',
        password: '',
    });

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateUserData) => createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: 'Success!', description: 'User created successfully.' });
            setShowCreateForm(false);
            setFormData({ fullName: '', email: '', password: '' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const banMutation = useMutation({
        mutationFn: (userId: string) => banUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: 'Success!', description: 'User banned successfully.' });
        },
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => removeUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: 'Success!', description: 'User removed successfully.' });
        },
    });

    const emailMutation = useMutation({
        mutationFn: (data: EmailData) => sendEmail(data),
        onSuccess: (response) => {
            toast({ title: 'Success!', description: response.message });
            setShowEmailDialog(false);
            setSelectedUsers([]);
            setEmailData({ subject: '', message: '' });
        },
    });

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const selectAllUsers = () => {
        if (users) {
            const allIds = users.map(u => u.id);
            setSelectedUsers(allIds);
        }
    };

    const handleSendEmail = (recipients: string[]) => {
        const emailList = users?.filter(u => recipients.includes(u.id)).map(u => u.email) || [];
        emailMutation.mutate({
            to: emailList,
            subject: emailData.subject,
            message: emailData.message,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Users Management</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage users, send emails, and moderate accounts</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="h-12 gap-2">
                    <Plus className="h-4 w-4" />
                    {showCreateForm ? 'Cancel' : 'Create User'}
                </Button>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                        <CardDescription>Add a new user to the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Full Name</label>
                                <Input required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g., John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Email</label>
                                <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@example.com" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Password</label>
                                <Input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                            </div>
                            <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                                {createMutation.isPending ? 'Creating...' : 'Create User'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <Card className="bg-primary/5 border-primary">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <p className="text-sm font-medium">{selectedUsers.length} user(s) selected</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setShowEmailDialog(true); }}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email Selected
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>Clear Selection</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Email Dialog */}
            {showEmailDialog && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle>Send Email</CardTitle>
                        <CardDescription>Sending to {selectedUsers.length} recipient(s)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Subject</label>
                            <Input value={emailData.subject} onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })} placeholder="Email subject" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Message</label>
                            <textarea className="w-full min-h-[120px] px-3 py-2 border rounded-lg resize-none" value={emailData.message} onChange={(e) => setEmailData({ ...emailData, message: e.target.value })} placeholder="Your message..." />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => handleSendEmail(selectedUsers)} disabled={emailMutation.isPending || !emailData.subject || !emailData.message}>
                                {emailMutation.isPending ? 'Sending...' : 'Send Email'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users List */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    {users && users.length > 0 && (
                        <div className="flex justify-between items-center mb-4">
                            <Button variant="outline" size="sm" onClick={selectAllUsers}>Select All</Button>
                            <Button variant="outline" size="sm" onClick={() => { setShowEmailDialog(true); selectAllUsers(); }}>
                                <Mail className="h-4 w-4 mr-2" />
                                Email All
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {users?.map((user: User) => (
                            <Card key={user.id} className={`hover:shadow-lg transition-shadow ${selectedUsers.includes(user.id) ? 'border-primary' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} className="mt-1 h-4 w-4" />
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{user.fullName}</CardTitle>
                                                <CardDescription className="mt-1">{user.email}</CardDescription>
                                            </div>
                                        </div>
                                        {user.status === 'active' ? (
                                            <Badge className="bg-green-500 flex-shrink-0">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="flex-shrink-0">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Banned
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        <p>ID: {user.id}</p>
                                        <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        {user.lastLogin && <p>Last login: {new Date(user.lastLogin).toLocaleDateString()}</p>}
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        <Button variant="outline" size="sm" onClick={() => handleSendEmail([user.id])}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email
                                        </Button>
                                        {user.status === 'active' ? (
                                            <Button variant="outline" size="sm" onClick={() => banMutation.mutate(user.id)} disabled={banMutation.isPending}>
                                                <Ban className="h-4 w-4 mr-2" />
                                                Ban
                                            </Button>
                                        ) : (
                                            <Badge variant="outline">Banned</Badge>
                                        )}
                                        <Button variant="destructive" size="sm" onClick={() => removeMutation.mutate(user.id)} disabled={removeMutation.isPending}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {users && users.length === 0 && !showCreateForm && (
                <div className="text-center py-12">
                    <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users found. Click "Create User" to add one.</p>
                </div>
            )}
        </div>
    );
}
