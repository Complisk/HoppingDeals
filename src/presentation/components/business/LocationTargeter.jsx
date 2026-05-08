"use client";

import { cn } from "@/presentation/lib/utils";
import { Label } from "@/presentation/components/ui/label";
import { MapPin, X } from "lucide-react";
import PlaceSearch from "@/presentation/components/shared/PlaceSearch";
const timezones = [
    "Eastern",
    "Central",
    "Mountain",
    "Pacific",
    "Alaska",
    "Hawaii-Aleutian",
];
export const LocationTargeter = ({ selectedCities, selectedStates, selectedTimezones, onAddCity, onRemoveCity, onAddState, onRemoveState, onTimezoneToggle, }) => {
    const handleSelectLocation = (place, type) => {
        const location = {
            placeId: place.placeId,
            id: place.placeId,
            name: type === "city" ? place.city || place.name : place.state || place.name,
            state_name: place.state || "",
            state_code: place.state_code || "",
            country_code: place.country_code || "",
            country_name: place.country || "",
            lat: place.lat,
            lng: place.lng,
            mapLocation: place.mapLocation,
            formattedAddress: place.formattedAddress,
        };
        if (type === "city")
            onAddCity(location);
        else
            onAddState(location);
    };
    return (<div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 3
        </span>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary"/>
          Target Locations & Timezone
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Inputs */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="mb-4">
            <h4 className="font-semibold text-foreground">Search Locations</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Max 2 cities • Multiple states • Multiple timezones
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label>City 1</label>
              <PlaceSearch searchType="city" onSelectPlace={(place) => handleSelectLocation(place, "city")}/>
            </div>

            <div>
              <label>City 2</label>
              <PlaceSearch searchType="city" onSelectPlace={(place) => handleSelectLocation(place, "city")}/>
            </div>
            <div>
              <label>State</label>
              <PlaceSearch searchType="state" onSelectPlace={(place) => handleSelectLocation(place, "state")}/>
            </div>
          </div>
        </div>

        {/* Selected Locations */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h4 className="font-semibold text-foreground">Selected Locations</h4>

          {selectedCities.length === 0 && selectedStates.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50"/>
              <p>No locations selected</p>
              <p className="text-sm">Search and select cities or states</p>
            </div>) : (<div className="space-y-2">
              {selectedCities.map((city) => (<div key={city.id} className="flex items-center justify-between px-4 py-2 bg-blue-100 rounded-lg">
                  <div>
                    <span className="text-foreground font-medium">
                      {city.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {city.state_name} • City
                    </span>
                  </div>
                  <button onClick={() => onRemoveCity(city.id)} className="text-xs text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4"/>
                  </button>
                </div>))}

              {selectedStates.map((state) => (<div key={state.id} className="flex items-center justify-between px-4 py-2 bg-green-100 rounded-lg">
                  <div>
                    <span className="text-foreground font-medium">
                      {state.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      State
                    </span>
                  </div>
                  <button onClick={() => onRemoveState(state.id)} className="text-xs text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4"/>
                  </button>
                </div>))}
            </div>)}
        </div>

        {/* Timezone Selection */}
        {/* <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="mb-4">
            <h4 className="font-semibold text-foreground">Timezone(s)</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Select multiple timezones
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {timezones.map((tz) => (
              <button
                key={tz}
                onClick={() => onTimezoneToggle(tz)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedTimezones.includes(tz)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground",
                )}
              >
                {tz.split("-")[0]}
              </button>
            ))}
          </div>

          {selectedTimezones.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Selected: {selectedTimezones.length}
              </p>
              <div className="space-y-2">
                {selectedTimezones.map((tz) => (
                  <div
                    key={tz}
                    className="flex items-center justify-between px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm"
                  >
                    <span>{tz.split("-")[0]}</span>
                    <button
                      onClick={() => onTimezoneToggle(tz)}
                      className="hover:text-primary-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div> */}
      </div>
    </div>);
};
