import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import CSRFProtection from '@/lib/csrf';

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export default function UserManagement() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only show to admins
  if (userProfile?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Access Restricted</h3>
        <p className="text-gray-500">User management is only available to administrators.</p>
      </div>
    );
  }

  useEffect(() => {
    // Initialize CSRF protection
    CSRFProtection.generateToken();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. You may not have permission to view user profiles.');
        setLoading(false);
        return;
      }
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // CSRF Protection - validate token before making changes
      const csrfToken = CSRFProtection.getToken();
      if (!CSRFProtection.validateToken(csrfToken)) {
        setError('Security validation failed. Please refresh the page.');
        return;
      }

      // Prevent users from changing their own role to avoid lockout
      if (userId === userProfile?.id) {
        setError('You cannot change your own role for security reasons.');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          // Add metadata for audit trail
          updated_by: userProfile?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        setError('Failed to update user role. You may not have permission.');
        return;
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setError(''); // Clear any previous errors
      
      // Generate new CSRF token after successful operation
      CSRFProtection.generateToken();
      
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again.');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value: 'user' | 'admin') => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}