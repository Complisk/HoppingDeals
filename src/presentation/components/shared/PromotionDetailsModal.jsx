"use client";

import { Button } from "@/presentation/components/ui/button";
import { Eye, MousePointerClick, Type, X } from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/presentation/components/ui/dialog";
import { Badge } from "@/presentation/components/ui/badge";
import { ScrollArea } from "@/presentation/components/ui/scroll-area";
import { Separator } from "@/presentation/components/ui/separator";
import { Calendar, Clock, MapPin, Globe, DollarSign, CheckCircle2, AlertCircle, XCircle, Palette, } from "lucide-react";
import { format } from "date-fns";
import { PromotionVisualCard } from "@/presentation/components/shared/PromotionVisualCard";
export const PromotionDetailsModal = ({ promotion, open, onClose, }) => {
    if (!promotion)
        return null;
    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return (<Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1"/>
            Active
          </Badge>);
            case "pending":
                return (<Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertCircle className="h-3 w-3 mr-1"/>
            Pending
          </Badge>);
            case "inactive":
                return (<Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <XCircle className="h-3 w-3 mr-1"/>
            Inactive
          </Badge>);
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };
    // Get payment status badge
    const getPaymentBadge = (paymentStatus) => {
        if (paymentStatus === "completed" || paymentStatus === "paid") {
            return (<Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          Paid
        </Badge>);
        }
        return (<Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
        {paymentStatus || "Pending"}
      </Badge>);
    };
    // Parse text data
    const textData = promotion.text || {};
    const textContent = textData.content || "";
    const textX = textData.x || 50;
    const textY = textData.y || 50;
    const textColor = textData.color || "#ffffff";
    const fontSize = textData.fontSize || "24";
    // Background color - check both root and text object
    const backgroundColor = promotion.backgroundColor || textData.backgroundColor || null;
    return (<Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Promotion Details
            </DialogTitle>
            {/* <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button> */}
          </div>
          {promotion.business?.name && (<p className="text-muted-foreground">{promotion.business.name}</p>)}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Image Preview with Text Overlay */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary"/>
                Promotion Preview
              </h3>
              <PromotionVisualCard imageUrl={promotion.imageUrl} backgroundColor={backgroundColor} text={promotion?.text} className="aspect-video shadow-lg border-2 border-border"/>
            </div>

            <Separator />

            {/* Status & Price Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                {getStatusBadge(promotion.status)}
              </div>
              <div className="bg-card border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="text-xl font-bold text-primary flex items-center">
                  <DollarSign className="h-5 w-5"/>
                  {promotion.price}
                </p>
              </div>
              {/* <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Payment</p>
          {getPaymentBadge(promotion.paymentStatus)}
        </div> */}
              {/* <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Category</p>
          <Badge variant="secondary">{promotion.category}</Badge>
        </div> */}
            </div>

            {/* Engagement Stats */}
            {/* <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(promotion.views || 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <MousePointerClick className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(promotion.clicks || 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
            </div>
          </div>
        </div> */}

            <Separator />

            {/* Schedule */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary"/>
                Schedule
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {promotion.runDate
            ? format(new Date(promotion.runDate), "MMM d, yyyy")
            : "-"}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {promotion.stopDate
            ? format(new Date(promotion.stopDate), "MMM d, yyyy")
            : "-"}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3"/>
                    {promotion.runTime?.slice(0, 5) || "-"}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">End Time</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3"/>
                    {promotion.stopTime?.slice(0, 5) || "-"}
                  </p>
                </div>
              </div>
              {promotion.calculatedMonths && (<p className="text-sm text-muted-foreground">
                  Duration: {promotion.calculatedMonths} month(s)
                </p>)}
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary"/>
                Target Location
              </h3>

              {/* Cities */}
              {promotion.cities && promotion.cities.length > 0 && (<div>
                  <p className="text-xs text-muted-foreground mb-2">Cities</p>
                  <div className="flex flex-wrap gap-2">
                    {promotion.cities.map((city, i) => (<Badge key={i} variant="outline" className="bg-card px-3 py-1">
                        <MapPin className="h-3 w-3 mr-1"/>
                        {city.name}
                        {city.state_code && `, ${city.state_code}`}
                      </Badge>))}
                  </div>
                </div>)}

              {/* States */}
              {promotion.states && promotion.states.length > 0 && (<div>
                  <p className="text-xs text-muted-foreground mb-2">States</p>
                  <div className="flex flex-wrap gap-2">
                    {promotion.states.map((state, i) => (<Badge key={i} variant="outline" className="bg-card px-3 py-1">
                        <Globe className="h-3 w-3 mr-1"/>
                        {state.name || state.code}
                      </Badge>))}
                  </div>
                </div>)}

              {/* Timezones */}
              {promotion.timezones && promotion.timezones.length > 0 && (<div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Timezones
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promotion.timezones.map((tz, i) => (<Badge key={i} variant="secondary" className="px-3 py-1">
                        <Clock className="h-3 w-3 mr-1"/>
                        {tz}
                      </Badge>))}
                  </div>
                </div>)}
            </div>

            {/* Business Info (for admin view) */}
            {promotion.business && (<>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Business Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        Business Name
                      </p>
                      <p className="font-medium">
                        {promotion.business.name || "-"}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {promotion.business.email || "-"}
                      </p>
                    </div>
                    {promotion.business.autoApprovePromotions !== undefined && (<div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">
                          Auto-Approve
                        </p>
                        <Badge variant={promotion.business.autoApprovePromotions
                    ? "default"
                    : "secondary"}>
                          {promotion.business.autoApprovePromotions
                    ? "Enabled"
                    : "Disabled"}
                        </Badge>
                      </div>)}
                  </div>
                </div>
              </>)}

            {/* Created/Updated Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
              {promotion.createdAt && (<span>
                  Created:{" "}
                  {format(new Date(promotion.createdAt), "MMM d, yyyy HH:mm")}
                </span>)}
              {promotion.updatedAt && (<span>
                  Updated:{" "}
                  {format(new Date(promotion.updatedAt), "MMM d, yyyy HH:mm")}
                </span>)}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>);
};
export default PromotionDetailsModal;
