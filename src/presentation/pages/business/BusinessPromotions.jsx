"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/presentation/components/ui/badge";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Eye, Search, Plus, Calendar, MapPin, Clock, Edit, Power, PowerOff, Loader2, } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/presentation/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/ui/tabs";
import { useToast } from "@/presentation/hooks/use-toast";
import { usePromotionService } from "@/presentation/services/promotionService";
import BoxLoader from "@/presentation/components/shared/BoxLoader";
import { PromotionDetailsModal } from "@/presentation/components/shared/PromotionDetailsModal";
import { PromotionVisualCard } from "@/presentation/components/shared/PromotionVisualCard";
/* ---------------------------------- */
/* Tabs Configuration */
/* ---------------------------------- */
const TABS = [
    { value: "all", label: "All", emptyText: "No promotions yet" },
    { value: "active", label: "Active", emptyText: "No active promotions yet" },
    { value: "inactive", label: "Inactive", emptyText: "No inactive promotions" },
    { value: "pending", label: "Pending", emptyText: "No pending promotions" },
];
const BusinessPromotions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [apiPromotions, setApiPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState(null);
    const [actioningId, setActioningId] = useState(null);
    const { toast } = useToast();
    const { getBusinessPromotions, activatePromotion, deactivatePromotion } = usePromotionService();
    const fetchPromotions = async ({ loading = true } = {}) => {
        if (loading)
            setIsLoading(true);
        try {
            const { response, error } = await getBusinessPromotions(searchQuery, activeTab);
            if (error) {
                toast({
                    title: "Error",
                    description: error,
                    variant: "destructive",
                });
                setApiPromotions([]);
            }
            else {
                setApiPromotions(response || []);
            }
        }
        catch (err) {
            console.error("Fetch promotions error:", err);
            toast({
                title: "Error",
                description: "Failed to fetch promotions",
                variant: "destructive",
            });
            setApiPromotions([]);
        }
        finally {
            if (loading)
                setIsLoading(false);
        }
    };
    /* Fetch on mount + tab change + search */
    useEffect(() => {
        fetchPromotions();
    }, [searchQuery, activeTab]);
    /* ---------------------------------- */
    /* Helpers */
    /* ---------------------------------- */
    const getStatusColor = (status) => {
        if (status === "active")
            return "default";
        if (status === "pending")
            return "secondary";
        return "outline";
    };
    /* ---------------------------------- */
    /* Actions */
    /* ---------------------------------- */
    const handleActivate = async (e, promotionId) => {
        e.stopPropagation();
        try {
            setActioningId(promotionId);
            await activatePromotion(promotionId);
            toast({
                title: "Success",
                description: "Promotion activated successfully",
            });
            setActioningId(null);
            fetchPromotions({ loading: false });
        }
        catch (error) {
            console.error("Activate error:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to activate promotion",
                variant: "destructive",
            });
        }
        finally {
        }
    };
    const handleDeactivate = async (e, promotionId) => {
        e.stopPropagation();
        try {
            setActioningId(promotionId);
            await deactivatePromotion(promotionId);
            toast({
                title: "Success",
                description: "Promotion deactivated successfully",
            });
            setActioningId(null);
            fetchPromotions({ loading: false });
        }
        catch (error) {
            console.error("Deactivate error:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to deactivate promotion",
                variant: "destructive",
            });
        }
        finally {
        }
    };
    const handleDelete = () => {
        toast({
            title: "Promotion Deleted",
            description: "Promotion deleted successfully.",
        });
        setShowDeleteDialog(false);
        setPromotionToDelete(null);
        fetchPromotions();
    };
    /* ---------------------------------- */
    /* Promotion Card */
    /* ---------------------------------- */
    const PromotionCard = ({ promotion }) => (<div className="bg-card border rounded-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPromotion(promotion)}>
      <PromotionVisualCard imageUrl={promotion.imageUrl} backgroundColor={promotion.backgroundColor} text={promotion.text} className="aspect-video rounded-none border-b" showOverlay={false}>
        <Badge variant={getStatusColor(promotion.status)} className="absolute top-3 right-3 capitalize">
          {promotion.status}
        </Badge>
      </PromotionVisualCard>

      <div className="p-4">
        <h3 className="font-bold truncate mb-2">{promotion.category}</h3>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4"/>
            {promotion.states?.length || 0} states,{" "}
            {promotion.cities?.length || 0} cities
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4"/>
            {new Date(promotion.runDate).toLocaleDateString()} -{" "}
            {new Date(promotion.stopDate).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4"/>
            {promotion.runTime} - {promotion.stopTime}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm mb-4 border-b pb-4">
          <Eye className="h-4 w-4 text-primary"/>
          <span className="font-medium">{promotion.views || 0}</span>
          <span className="text-muted-foreground">views</span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">${promotion.price}</span>
          <span className="text-xs text-muted-foreground">
            {promotion.timezones?.length || 0} timezones
          </span>
        </div>

        {(promotion.status == "active" || promotion.status == "inactive") && (<div className="flex gap-2 pt-2 border-t border-border">
            <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()} className="flex-1 gap-1">
              <Link href={`/business/edit-promotion/${promotion.id}`}>
                <Edit className="h-4 w-4 "/>
                Edit
              </Link>
            </Button>

            {promotion.status == "active" && (<Button size="sm" variant="ghost" onClick={(e) => handleDeactivate(e, promotion.id)} disabled={actioningId === promotion.id} className="gap-1 text-orange-600 hover:bg-orange-50">
                {actioningId === promotion.id ? (<Loader2 className="animate-spin"/>) : (<PowerOff className="h-4 w-4"/>)}
                Deactivate
              </Button>)}

            {promotion.status == "inactive" && (<Button size="sm" variant="ghost" onClick={(e) => handleActivate(e, promotion.id)} disabled={actioningId === promotion.id} className="gap-1 text-green-600 hover:bg-green-50">
                {actioningId === promotion.id ? (<Loader2 className="animate-spin"/>) : (<Power className="h-4 w-4"/>)}
                Activate
              </Button>)}
          </div>)}
      </div>
    </div>);
    /* ---------------------------------- */
    /* Promotion Grid */
    /* ---------------------------------- */
    const PromotionGrid = ({ emptyText }) => {
        if (isLoading) {
            return (<div className="py-6">
          <BoxLoader count={3}/>
        </div>);
        }
        if (!apiPromotions.length) {
            return (<div className="text-center py-12 text-muted-foreground">
          {emptyText}
        </div>);
        }
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiPromotions.map((promotion) => (<PromotionCard key={promotion.id} promotion={promotion}/>))}
      </div>);
    };
    /* ---------------------------------- */
    /* Render */
    /* ---------------------------------- */
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Promotions</h1>
          <p className="text-muted-foreground">Manage all your promotions</p>
        </div>

        <Button variant="hero" asChild>
          <Link href="/business/create-promotion">
            <Plus className="h-5 w-5 mr-2"/> Create Promotion
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <Input placeholder="Search promotions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {TABS.map((tab) => (<TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>))}
        </TabsList>

        {TABS.map((tab) => (<TabsContent key={tab.value} value={tab.value} className="mt-6">
            <PromotionGrid emptyText={tab.emptyText}/>
          </TabsContent>))}
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Details Modal */}
      <PromotionDetailsModal promotion={selectedPromotion} open={!!selectedPromotion} onClose={() => setSelectedPromotion(null)}/>
    </div>);
};
export default BusinessPromotions;
