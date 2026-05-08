"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/presentation/hooks/use-redux";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Input } from "@/presentation/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/presentation/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/presentation/components/ui/table";
import { Badge } from "@/presentation/components/ui/badge";
import { PermissionGuard, PermissionButton, } from "@/presentation/components/shared/PermissionGuard";
import adminService from "@/presentation/services/adminService";
import { useToast } from "@/presentation/hooks/use-toast";
import { Lock, Unlock, CheckCircle, XCircle } from "lucide-react";
const AdminUsersPage = () => {
    const { userToken } = useAppSelector((state) => state.auth);
    const { toast } = useToast();
    const { hasPermission, isLoading: permLoading } = usePermissions();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    useEffect(() => {
        if (userToken && !permLoading) {
            loadUsers();
        }
    }, [userToken, permLoading]);
    const loadUsers = async () => {
        if (!hasPermission("users", "view")) {
            toast.error("You don't have permission to view users");
            return;
        }
        try {
            setLoading(true);
            const response = await adminService.getAllUsers();
            setUsers(response || []);
        }
        catch (error) {
            console.error("Error loading users:", error);
            toast.error("Failed to load users");
        }
        finally {
            setLoading(false);
        }
    };
    const handleStatusChange = async (userId, newStatus) => {
        if (!hasPermission("users", "edit")) {
            toast.error("You don't have permission to edit users");
            return;
        }
        try {
            await adminService.updateUserStatus(userId, newStatus);
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
            toast.success("User status updated");
        }
        catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update user status");
        }
    };
    const handleToggleBlock = async (user) => {
        if (!hasPermission("users", "edit")) {
            toast.error("You don't have permission to edit users");
            return;
        }
        try {
            const newStatus = user.isBlocked ? "active" : "blocked";
            await handleStatusChange(user.id, newStatus);
        }
        catch (error) {
            console.error("Error toggling block:", error);
        }
    };
    const filteredUsers = users.filter((u) => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return (<PermissionGuard module="users" action="view" fallback={<Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view users
            </CardDescription>
          </CardHeader>
        </Card>}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">
              Manage all user accounts and their statuses
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md"/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>
              {filteredUsers.length} users found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (<div className="text-center py-8">Loading...</div>) : filteredUsers.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                No users found
              </div>) : (<div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (<TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.fullName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active"
                    ? "default"
                    : "destructive"}>
                            {user.status === "active" ? (<CheckCircle size={14} className="mr-1"/>) : (<XCircle size={14} className="mr-1"/>)}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <PermissionButton module="users" action="edit" onClick={() => handleToggleBlock(user)} className="p-2 hover:bg-gray-100 rounded" title={user.isBlocked ? "Unblock" : "Block"}>
                              {user.isBlocked ? (<Unlock size={16}/>) : (<Lock size={16}/>)}
                            </PermissionButton>
                          </div>
                        </TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>);
};
export default AdminUsersPage;
