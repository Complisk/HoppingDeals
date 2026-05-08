"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Badge } from "@/presentation/components/ui/badge";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Search,
  MoreHorizontal,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useToast } from "@/presentation/hooks/use-toast";
import { useAdminService } from "@/presentation/services/adminService";
const AdminBusinesses = () => {
  const dispatch = useDispatch();
  const { getBusinesses, updateBusinessStatus, toggleBusinessAutoApprove } =
    useAdminService();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [autoApproveFilter, setAutoApproveFilter] = useState("all");
  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState();
  const [updating, setUpdating] = useState(false);
  const [togglingAutoApprove, setTogglingAutoApprove] = useState(false);
  const pageSize = 10;
  // Fetch businesses whenever filters change
  useEffect(() => {
    fetchBusinesses();
  }, [currentPage, selectedStatus, autoApproveFilter]);
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await getBusinesses(
        currentPage,
        pageSize,
        searchQuery,
        selectedStatus !== "all" ? selectedStatus : undefined,
        autoApproveFilter !== "all" ? autoApproveFilter === "true" : undefined,
      );
      if (response) {
        setBusinesses(response.businesses || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    setCurrentPage(1);
    fetchBusinesses();
  };
  const handleStatusChange = async () => {
    if (!selectedBusiness || !newStatus) return;
    try {
      setUpdating(true);
      await updateBusinessStatus(selectedBusiness.id, newStatus);
      // Refresh the businesses list
      await fetchBusinesses();
      setShowStatusDialog(false);
      setNewStatus("");
      setSelectedBusiness(null);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };
  const handleToggleAutoApprove = async (business) => {
    try {
      setTogglingAutoApprove(true);
      const newValue = !business.autoApprovePromotions;
      await toggleBusinessAutoApprove(business.id, newValue);
      // Refresh the businesses list
      await fetchBusinesses();
    } catch (error) {
      console.error("Error toggling auto-approve:", error);
    } finally {
      setTogglingAutoApprove(false);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const statuses = ["active", "inactive", "blocked", "suspended"];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Business Management
          </h1>
          <p className="text-muted-foreground">
            Manage all registered businesses
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pagination?.total || 0} Total
        </Badge>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>

        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={autoApproveFilter}
          onValueChange={(value) => {
            setAutoApproveFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Auto-Approve Setting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Businesses</SelectItem>
            <SelectItem value="true">Auto-Approve Enabled</SelectItem>
            <SelectItem value="false">Auto-Approve Disabled</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Search
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
        <Button
          variant={selectedStatus === "all" ? "default" : "ghost"}
          onClick={() => {
            setSelectedStatus("all");
            setCurrentPage(1);
          }}
        >
          All Businesses
        </Button>
        {statuses.map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "ghost"}
            onClick={() => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No businesses found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-secondary text-left text-sm">
                <tr>
                  <th className="p-4">Business</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Auto-Approve</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-secondary/50">
                    <td className="p-4 font-medium">{business.name}</td>
                    <td className="p-4 text-muted-foreground">
                      {business.email}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{business.businessType}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(business.status)}>
                        {business.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAutoApprove(business)}
                        disabled={togglingAutoApprove}
                      >
                        {business.autoApprovePromotions ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-green-600 text-xs">
                              Enabled
                            </span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-gray-600 text-xs">
                              Disabled
                            </span>
                          </>
                        )}
                      </Button>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBusiness(business);
                              setNewStatus(business.status);
                              setShowStatusDialog(true);
                            }}
                          >
                            Change Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.pages} (
                  {pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pagination.pages}
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pagination.pages, currentPage + 1),
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Business Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Status</p>
              <Badge className={getStatusColor(selectedBusiness?.status)}>
                {selectedBusiness?.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">New Status</p>
              <Select
                value={newStatus || ""}
                onValueChange={(value) => setNewStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={updating || !newStatus}
            >
              {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminBusinesses;
