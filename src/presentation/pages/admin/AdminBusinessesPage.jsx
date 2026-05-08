"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/presentation/hooks/use-redux";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Input } from "@/presentation/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";
import { Badge } from "@/presentation/components/ui/badge";
import {
  PermissionGuard,
  PermissionButton,
} from "@/presentation/components/shared/PermissionGuard";
import adminService from "@/presentation/services/adminService";
import { useToast } from "@/presentation/hooks/use-toast";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
const AdminBusinessPage = () => {
  const { userToken } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const { hasPermission, isLoading: permLoading } = usePermissions();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    if (userToken && !permLoading) {
      loadBusinesses();
    }
  }, [userToken, permLoading]);
  const loadBusinesses = async () => {
    if (!hasPermission("businesses", "view")) {
      toast.error("You don't have permission to view businesses");
      return;
    }
    try {
      setLoading(true);
      const response = await adminService.getAllBusinesses();
      setBusinesses(response || []);
    } catch (error) {
      console.error("Error loading businesses:", error);
      toast.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (businessId, newStatus) => {
    if (!hasPermission("businesses", "edit")) {
      toast.error("You don't have permission to edit businesses");
      return;
    }
    try {
      await adminService.updateBusinessStatus(businessId, newStatus);
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === businessId ? { ...b, status: newStatus } : b,
        ),
      );
      toast.success("Business status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update business status");
    }
  };
  const handleToggleBlock = async (business) => {
    if (!hasPermission("businesses", "edit")) {
      toast.error("You don't have permission to edit businesses");
      return;
    }
    try {
      const newStatus = business.isBlocked ? "active" : "blocked";
      await handleStatusChange(business.id, newStatus);
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  };
  const handleToggleAutoApprove = async (businessId) => {
    if (!hasPermission("businesses", "approve")) {
      toast.error("You don't have permission to approve businesses");
      return;
    }
    try {
      await adminService.toggleBusinessAutoApprove(businessId);
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === businessId ? { ...b, autoApprove: !b.autoApprove } : b,
        ),
      );
      toast.success("Auto-approve setting updated");
    } catch (error) {
      console.error("Error toggling auto-approve:", error);
      toast.error("Failed to update auto-approve setting");
    }
  };
  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <PermissionGuard
      module="businesses"
      action="view"
      fallback={
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view businesses
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Businesses</h1>
            <p className="text-muted-foreground">
              Manage all business accounts and their settings
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business List</CardTitle>
            <CardDescription>
              {filteredBusinesses.length} businesses found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No businesses found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Auto-Approve</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">
                          {business.name}
                        </TableCell>
                        <TableCell>{business.email}</TableCell>
                        <TableCell>{business.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              business.status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {business.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {business.autoApprove ? (
                            <Badge variant="default">Enabled</Badge>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <PermissionButton
                              module="businesses"
                              action="approve"
                              onClick={() =>
                                handleToggleAutoApprove(business.id)
                              }
                              className="p-2 hover:bg-gray-100 rounded"
                              title="Toggle auto-approve"
                            >
                              {business.autoApprove ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </PermissionButton>
                            <PermissionButton
                              module="businesses"
                              action="edit"
                              onClick={() => handleToggleBlock(business)}
                              className="p-2 hover:bg-gray-100 rounded"
                              title={business.isBlocked ? "Unblock" : "Block"}
                            >
                              {business.isBlocked ? (
                                <Unlock size={16} />
                              ) : (
                                <Lock size={16} />
                              )}
                            </PermissionButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};
export default AdminBusinessPage;
