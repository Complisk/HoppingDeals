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
import { Trash2, CheckCircle, XCircle } from "lucide-react";
const AdminPromotionsPage = () => {
  const { userToken } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const { hasPermission, isLoading: permLoading } = usePermissions();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    if (userToken && !permLoading) {
      loadPromotions();
    }
  }, [userToken, permLoading]);
  const loadPromotions = async () => {
    if (!hasPermission("promotions", "view")) {
      toast.error("You don't have permission to view promotions");
      return;
    }
    try {
      setLoading(true);
      const response = await adminService.getAllPromotions();
      setPromotions(response || []);
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (promotionId, newStatus) => {
    if (!hasPermission("promotions", "edit")) {
      toast.error("You don't have permission to edit promotions");
      return;
    }
    try {
      await adminService.changePromotionStatus(promotionId, newStatus);
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promotionId ? { ...p, status: newStatus } : p,
        ),
      );
      toast.success("Promotion status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update promotion status");
    }
  };
  const handleDelete = async (promotionId) => {
    if (!hasPermission("promotions", "delete")) {
      toast.error("You don't have permission to delete promotions");
      return;
    }
    if (!confirm("Are you sure you want to delete this promotion?")) {
      return;
    }
    try {
      await adminService.deletePromotion(promotionId);
      setPromotions((prev) => prev.filter((p) => p.id !== promotionId));
      toast.success("Promotion deleted");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion");
    }
  };
  const handleApprove = async (promotionId) => {
    if (!hasPermission("promotions", "approve")) {
      toast.error("You don't have permission to approve promotions");
      return;
    }
    try {
      await handleStatusChange(promotionId, "active");
    } catch (error) {
      console.error("Error approving promotion:", error);
    }
  };
  const handleReject = async (promotionId) => {
    if (!hasPermission("promotions", "approve")) {
      toast.error("You don't have permission to approve promotions");
      return;
    }
    try {
      await handleStatusChange(promotionId, "rejected");
    } catch (error) {
      console.error("Error rejecting promotion:", error);
    }
  };
  const filteredPromotions = promotions.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <PermissionGuard
      module="promotions"
      action="view"
      fallback={
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view promotions
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Promotions</h1>
            <p className="text-muted-foreground">
              Manage all promotions and their status
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by title or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promotion List</CardTitle>
            <CardDescription>
              {filteredPromotions.length} promotions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredPromotions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No promotions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.map((promotion) => (
                      <TableRow key={promotion.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{promotion.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {promotion.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{promotion.businessName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              promotion.status === "active"
                                ? "default"
                                : promotion.status === "pending"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {promotion.status === "active" ? (
                              <CheckCircle size={14} className="mr-1" />
                            ) : promotion.status === "rejected" ? (
                              <XCircle size={14} className="mr-1" />
                            ) : null}
                            {promotion.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(promotion.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {promotion.status === "pending" && (
                              <>
                                <PermissionButton
                                  module="promotions"
                                  action="approve"
                                  onClick={() => handleApprove(promotion.id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                >
                                  Approve
                                </PermissionButton>
                                <PermissionButton
                                  module="promotions"
                                  action="approve"
                                  onClick={() => handleReject(promotion.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                  Reject
                                </PermissionButton>
                              </>
                            )}
                            <PermissionButton
                              module="promotions"
                              action="delete"
                              onClick={() => handleDelete(promotion.id)}
                              className="p-2 hover:bg-gray-100 rounded text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={16} />
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
export default AdminPromotionsPage;
