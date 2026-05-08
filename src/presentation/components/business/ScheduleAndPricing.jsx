"use client";

import { Clock } from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Button } from "@/presentation/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export const ScheduleAndPricing = ({
  selectedStatesCount,
  selectedTimezonesCount,
  selectedTimezones,
  months,
  startDate,
  startTime,
  endDate,
  endTime,
  selectedEndDate,
  businessType = "offline",
  isLoading = false,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onRunPromotion,
}) => {
  // Determine if online store or physical location
  const isOnlineStore = businessType === "online-ecommerce";
  // Pricing constants
  const ONLINE_BASE = 10;
  const ONLINE_STATE_COST = 10;
  const ONLINE_TIMEZONE_COST = 30;
  const ONLINE_EASTERN_COST = 50;
  const PHYSICAL_STARTER = 10;
  const PHYSICAL_STATE_COST = 20;
  const PHYSICAL_TIMEZONE_COST = 60;
  const PHYSICAL_EASTERN_COST = 100;
  // Check if Eastern timezone is selected
  const hasEasternTimezone = selectedTimezones?.some((tz) =>
    tz.toLowerCase().includes("eastern"),
  );
  // Calculate pricing based on business type
  let baseCost = 0;
  let stateCost = 0;
  let timezoneCost = 0;
  if (isOnlineStore) {
    // ONLINE STORE PRICING
    baseCost = ONLINE_BASE; // $10 base (includes 1 state)
    // Additional states (beyond first)
    if (selectedStatesCount > 1) {
      stateCost = (selectedStatesCount - 1) * ONLINE_STATE_COST;
    }
    // Timezones
    if (selectedTimezonesCount > 0) {
      if (hasEasternTimezone) {
        const nonEasternCount = selectedTimezones.filter(
          (tz) => !tz.toLowerCase().includes("eastern"),
        ).length;
        timezoneCost =
          nonEasternCount * ONLINE_TIMEZONE_COST + ONLINE_EASTERN_COST;
      } else {
        timezoneCost = selectedTimezonesCount * ONLINE_TIMEZONE_COST;
      }
    }
  } else {
    // PHYSICAL LOCATION PRICING
    if (selectedStatesCount > 0) {
      // States selected: $20 per state (NO base $10)
      stateCost = selectedStatesCount * PHYSICAL_STATE_COST;
      baseCost = 0;
    } else {
      // No states: Starter plan $10
      baseCost = PHYSICAL_STARTER;
    }
    // Timezones
    if (selectedTimezonesCount > 0) {
      if (hasEasternTimezone) {
        const nonEasternCount = selectedTimezones.filter(
          (tz) => !tz.toLowerCase().includes("eastern"),
        ).length;
        timezoneCost =
          nonEasternCount * PHYSICAL_TIMEZONE_COST + PHYSICAL_EASTERN_COST;
      } else {
        timezoneCost = selectedTimezonesCount * PHYSICAL_TIMEZONE_COST;
      }
    }
  }
  const subtotal = baseCost + stateCost + timezoneCost;
  const totalCost = subtotal * months;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 4
        </span>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Schedule & Review Pricing
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start Date/Time */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h4 className="font-medium text-foreground">Start</h4>
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => onStartDateChange(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date(selectedEndDate)}
                minDate={new Date()}
                className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholderText="Select start date"
                dateFormat="MMM dd, yyyy"
                calendarClassName="!bg-card !border-border !text-foreground"
                wrapperClassName="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* End Date/Time */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h4 className="font-medium text-foreground">End</h4>
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date) => onEndDateChange(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date(selectedEndDate)}
                minDate={startDate || new Date()}
                className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholderText="Select end date"
                dateFormat="MMM dd, yyyy"
                calendarClassName="!bg-card !border-border !text-foreground"
                wrapperClassName="w-full"
                highlightDates={startDate ? [startDate] : []}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4">
          <h4 className="font-semibold text-foreground">Pricing Breakdown</h4>

          <div className="space-y-3 text-sm">
            {/* States */}
            {stateCost > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {isOnlineStore
                    ? `${selectedStatesCount - 1} Additional State${selectedStatesCount - 1 !== 1 ? "s" : ""} @ $${ONLINE_STATE_COST}/each`
                    : `${selectedStatesCount} State${selectedStatesCount !== 1 ? "s" : ""} @ $${PHYSICAL_STATE_COST}/each`}
                </span>
                <span className="text-foreground font-medium">
                  ${stateCost}
                </span>
              </div>
            )}

            {/* Timezones */}
            {timezoneCost > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {selectedTimezonesCount} TimeZone
                  {selectedTimezonesCount !== 1 ? "s" : ""}
                  {hasEasternTimezone && " (incl. Eastern)"}
                </span>
                <span className="text-foreground font-medium">
                  ${timezoneCost}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border pt-3 mt-3" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-foreground font-semibold">Total:</span>
              <span className="text-lg font-bold text-primary">
                ${totalCost}
              </span>
            </div>
          </div>

          {/* Run Button */}
          <Button
            onClick={onRunPromotion}
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? "Creating..." : "RUN IT"}
          </Button>
        </div>
      </div>
    </div>
  );
};
