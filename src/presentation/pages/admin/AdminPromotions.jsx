"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Badge } from "@/presentation/components/ui/badge";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Search, Loader2, Trash2, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/presentation/components/ui/dropdown-menu";
import { useToast } from "@/presentation/hooks/use-toast";
import { useAdminService } from "@/presentation/services/adminService";
import { Switch } from "@/presentation/components/ui/switch";
import { PromotionDetailsModal } from "@/presentation/components/shared/PromotionDetailsModal";
const AdminPromotions = () => {
    const dispatch = useDispatch();
    const { getPromotions, updatePromotionStatus, deletePromotion, toggleBusinessAutoApprove, } = useAdminService();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [promotions, setPromotions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [updatingIds, setUpdatingIds] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState(null); // For modal
    const pageSize = 10;
    const statuses = ["active", "pending", "inactive"];
    // Fetch promotions whenever filters change
    useEffect(() => {
        fetchPromotions();
    }, [currentPage, selectedStatus]);
    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const response = await getPromotions(currentPage, pageSize, selectedStatus !== "all" ? selectedStatus : undefined, searchQuery);
            if (response) {
                setPromotions(response.promotions || []);
                setPagination(response.pagination);
            }
        }
        catch (error) {
            console.error("Error fetching promotions:", error);
            toast({
                title: "Error",
                description: "Failed to fetch promotions",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = () => {
        setCurrentPage(1);
        fetchPromotions();
    };
    const handleStatusChange = async (promo) => {
        if (!promo)
            return;
        if (promo.status === "expired") {
            toast({
                title: "Action Not Allowed",
                description: "Cannot change status of expired promotions",
                variant: "destructive",
            });
            return;
        }
        if (promo.status === "active") {
            toast({
                title: "Action Not Allowed",
                description: "Cannot change status of inactive promotions it will change from business side",
                variant: "destructive",
            });
            return;
        }
        const newStatusValue = promo.status == "pending" ? "inactive" : "pending";
        try {
            setUpdatingIds((prev) => [...prev, promo.id]);
            await updatePromotionStatus(promo.id, newStatusValue);
            setPromotions((prev) => prev.map((p) => p.id === promo.id ? { ...p, status: newStatusValue } : p));
        }
        catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        }
        finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== promo.id));
        }
    };
    const handleToggleAutoApprove = async (promo) => {
        if (!promo?.business)
            return;
        try {
            setUpdatingIds((prev) => [...prev, promo.id]);
            const newValue = !promo.business.autoApprovePromotions;
            await toggleBusinessAutoApprove(promo.business.id, newValue);
            setPromotions((prev) => prev.map((p) => p.id === promo.id
                ? {
                    ...p,
                    businessAutoApprove: newValue,
                    business: { ...p.business, autoApprovePromotions: newValue },
                }
                : p));
        }
        catch (error) {
            console.error("Error toggling auto-approve:", error);
            toast({
                title: "Error",
                description: "Failed to toggle auto-approve",
                variant: "destructive",
            });
        }
        finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== promo.id));
        }
    };
    const handleDelete = async (promo) => {
        if (!promo)
            return;
        try {
            setUpdatingIds((prev) => [...prev, promo.id]);
            await deletePromotion(promo.id);
            setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
        }
        catch (error) {
            console.error("Error deleting promotion:", error);
            toast({
                title: "Error",
                description: "Failed to delete promotion",
                variant: "destructive",
            });
        }
        finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== promo.id));
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "inactive":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Promotion Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all promotions
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pagination?.total || 0} Total
        </Badge>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search by business name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-10"/>
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
          Search
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
        <Button variant={selectedStatus === "all" ? "default" : "ghost"} onClick={() => {
            setSelectedStatus("all");
            setCurrentPage(1);
        }}>
          All Promotions
        </Button>
        {statuses.map((status) => (<Button key={status} variant={selectedStatus === status ? "default" : "ghost"} onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
            }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden relative">
        {loading ? (<div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground"/>
            <p className="text-muted-foreground mt-2">Loading promotions...</p>
          </div>) : promotions.length === 0 ? (<div className="p-8 text-center">
            <p className="text-muted-foreground">No promotions found</p>
          </div>) : (<table className={`w-full ${updatingIds.length ? "pointer-events-none opacity-50" : ""}`}>
            <thead className="bg-secondary text-left text-sm">
              <tr>
                <th className="p-4">Business</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Business Auto-Approve</th>
                <th className="p-4">Views</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">Date Range</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promotions.map((promo) => {
                const isUpdating = updatingIds.includes(promo.id);
                return (<tr key={promo.id} className="hover:bg-secondary/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{promo.business?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {promo.business?.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-medium">${promo?.price}</td>
                    <td className="p-4 flex items-center gap-4">
                      {promo.status === "active" ? (<Badge variant="default">Active</Badge>) : promo.status === "inactive" ? (<Badge variant="secondary">Inactive</Badge>) : promo.status === "pending" ? (<Badge variant="secondary">Pending Approval</Badge>) : (<Badge variant="outline">Expeired</Badge>)}
                      <Switch checked={promo?.status == "pending" ? false : true} onCheckedChange={() => handleStatusChange(promo)} disabled={isUpdating || updatingIds.length > 0}/>
                    </td>
                    <td className="p-4">
                      <Switch checked={promo?.business?.autoApprovePromotions} onCheckedChange={() => handleToggleAutoApprove(promo)} disabled={isUpdating || updatingIds.length > 0}/>
                    </td>
                    <td className="p-4">
                      {promo?.views?.toLocaleString() || 0}
                    </td>
                    <td className="p-4">
                      {promo?.clicks?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      <div>
                        <p>{new Date(promo.runDate).toLocaleDateString()}</p>
                        <p className="text-xs">
                          to {new Date(promo.stopDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedPromotion(promo)}>
                            <Eye className="h-4 w-4 mr-2"/>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(promo)} className="text-destructive" disabled={isUpdating || updatingIds.length > 0}>
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>);
            })}
            </tbody>
          </table>)}
      </div>

      {/* Pagination */}
      {pagination && (<div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.pages} (
            {pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1 || updatingIds.length > 0} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === pagination.pages || updatingIds.length > 0} onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}>
              Next
            </Button>
          </div>
        </div>)}

      {/* Promotion Details Modal */}
      <PromotionDetailsModal promotion={selectedPromotion} open={!!selectedPromotion} onClose={() => setSelectedPromotion(null)}/>
    </div>);
};
export default AdminPromotions;
