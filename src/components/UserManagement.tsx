import { useState, useEffect } from 'react';
import { Loader2, Users, Shield, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import client from '../api/client';
import { User as ApiUser } from '../types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function UserManagement() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRoles: string[]) => {
    setUpdatingUserId(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await client.patch(`/admin/users/${userId}`, {
        roles: newRoles,
      });
      
      // Update local state
      setUsers(users.map(u => u._id === userId ? response.data : u));
      setSuccess('User role updated successfully');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const toggleRole = (user: ApiUser, role: string) => {
    const currentRoles = user.roles;
    let newRoles: string[];

    if (currentRoles.includes(role)) {
      // Remove role (but always keep 'user')
      newRoles = currentRoles.filter(r => r !== role);
      if (newRoles.length === 0) {
        newRoles = ['user'];
      }
    } else {
      // Add role
      newRoles = [...currentRoles, role];
    }

    handleRoleUpdate(user._id, newRoles);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      admin: { variant: 'destructive', icon: Shield },
      founder: { variant: 'default', icon: Users },
      user: { variant: 'secondary', icon: Users },
    };

    const config = variants[role] || { variant: 'outline', icon: Users };
    const Icon = config.icon;

    return (
      <Badge key={role} variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {role}
      </Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.fullName.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredUsers.length} users
        </Badge>
      </div>

      {/* Status Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <CardTitle className="mb-2">No users found</CardTitle>
            <CardDescription>
              {searchQuery ? 'Try adjusting your search query' : 'No users in the system'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.fullName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {user.roles.map((role) => getRoleBadge(role))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-600">Projects Owned:</span>
                        <span className="ml-2 font-medium">{user.stats.totalProjectsOwned}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Contributed:</span>
                        <span className="ml-2 font-medium">${user.stats.totalContributed.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-48">
                    <label className="text-sm font-medium">Quick Actions</label>
                    <Button
                      variant={user.roles.includes('founder') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleRole(user, 'founder')}
                      disabled={updatingUserId === user._id}
                      className="w-full"
                    >
                      {updatingUserId === user._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : user.roles.includes('founder') ? (
                        'Remove Founder'
                      ) : (
                        'Make Founder'
                      )}
                    </Button>
                    <Button
                      variant={user.roles.includes('admin') ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => toggleRole(user, 'admin')}
                      disabled={updatingUserId === user._id}
                      className="w-full"
                    >
                      {updatingUserId === user._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : user.roles.includes('admin') ? (
                        'Remove Admin'
                      ) : (
                        'Make Admin'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
