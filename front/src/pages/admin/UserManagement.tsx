import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUserRole, deleteUser } from '../../services/expressApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from 'sonner';
import { UserPlus, UserMinus, UserCog } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

const handleAddUser = async () => {
  try {
    // Validate required fields
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error('Username, email, and password are required');
      return;
    }

    // Validate email format (basic check)
    if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password strength (optional)
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Send request to backend
    const response = await createUser(newUser);

    // Success: Reset form and refresh user list
    toast.success('User added successfully');
    setShowAddDialog(false);
    setNewUser({ username: '', email: '', password: '', role: 'user' });
    fetchUsers();

  } catch (error) {
    // Handle known error cases
    if (error.response) {
      // Backend validation errors (409, 400, etc.)
      const { status, data } = error.response;
      
      if (status === 409) {
        toast.error(data.message || 'User already exists'); // "Email/username taken"
      } 
      else if (status === 400) {
        toast.error(data.message || 'Invalid input data');
      }
      else {
        toast.error(`Error: ${data.message || 'Unknown server error'}`);
      }
    } 
    // Network errors (no internet, CORS, etc.)
    else if (error.request) {
      toast.error('Network error - please check your connection');
    } 
    // Frontend errors (thrown manually)
    else {
      toast.error(`Error: ${error.message}`);
    }

    console.error('User creation failed:', error);
  }
};

const handleChangeRole = async (userId: string, newRole: string) => {
  try {
    await updateUserRole(userId, newRole);
    toast.success('User role updated successfully');
    fetchUsers();
  } catch (error) {
    // Check for specific error responses from backend
    if (error.response) {
      if (error.response.status === 400) {
        toast.error(error.response.data.message || 'Invalid operation');
      } else if (error.response.status === 404) {
        toast.error('User not found');
      } else if (error.response.status === 401) {
        toast.error("You can't change your role")
      } else {
        toast.error('Failed to update user role');
      }
    } else {
      toast.error('Failed to update user role');
    }
    console.error(error);
  }
};

const handleDeleteUser = async () => {
  if (!selectedUser) return;
  
  try {
    await deleteUser(selectedUser.id);
    toast.success('User deleted successfully');
    setShowDeleteDialog(false);
    fetchUsers();
  } catch (error) {
    // Check for specific error responses from backend
    if (error.response) {
      if (error.response.status === 400) {
        toast.error(error.response.data.message || 'Cannot delete your own account');
      } else if (error.response.status === 404) {
        toast.error('User not found');
      } else if (error.reponse.status === 401){
        toast.error("You can't delete yourself")  
      } else {
        toast.error('Failed to delete user');
      }
    } else {
      toast.error('Failed to delete user');
    }
    console.error(error);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => {
                    const username = e.target.value;
                    const valid = /^[a-zA-Z0-9_]*$/.test(username);
                    if (valid || username === '') {
                    setNewUser({...newUser, username});}
                    }
                  }
                  placeholder="username"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading users...</div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleChangeRole(user.id, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user {selectedUser?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
