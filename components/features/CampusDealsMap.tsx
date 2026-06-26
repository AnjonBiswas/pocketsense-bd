"use client";

import { useEffect, useRef, useState } from "react";
import { BadgePercent, LoaderCircle, MapPin, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CAMPUS_DEALS, UNIVERSITY_SPOTS } from "@/data/campusDeals";

export function CampusDealsMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [isBootingMap, setIsBootingMap] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!token || !mapRef.current || !shouldLoadMap) {
      return;
    }

    let cleanup: (() => void) | undefined;
    setIsBootingMap(true);

    void import("mapbox-gl").then((module) => {
      const mapboxgl = module.default;
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: mapRef.current as HTMLDivElement,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [90.407, 23.78],
        zoom: 10.7
      });

      UNIVERSITY_SPOTS.forEach((spot) => {
        new mapboxgl.Marker({ color: "#10B981" })
          .setLngLat([spot.longitude, spot.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>${spot.name}</strong><p>University zone</p>`))
          .addTo(map);
      });

      CAMPUS_DEALS.forEach((deal) => {
        new mapboxgl.Marker({ color: deal.type === "discount" ? "#2563EB" : "#F97316" })
          .setLngLat([deal.longitude, deal.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>${deal.title}</strong><p>${deal.priceHint}</p>`))
          .addTo(map);
      });

      map.on("load", () => {
        setMapReady(true);
        setIsBootingMap(false);
      });
      cleanup = () => map.remove();
    });

    return () => cleanup?.();
  }, [shouldLoadMap, token]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden border-white/60 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Campus deals map</CardTitle>
        </CardHeader>
        <CardContent>
          {token ? (
            <div className="space-y-3">
              <div
                ref={mapRef}
                className="relative h-[420px] rounded-[28px] bg-slate-100 dark:bg-slate-900"
              >
                {!shouldLoadMap ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[28px] bg-slate-950/55 p-6 text-center text-white">
                    <p className="max-w-sm text-sm leading-6 text-white/85">
                      Load the live map only when you need it to keep this page lighter and faster.
                    </p>
                    <Button type="button" className="rounded-full" onClick={() => setShouldLoadMap(true)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Load live map
                    </Button>
                  </div>
                ) : null}

                {shouldLoadMap && !mapReady ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/75 backdrop-blur dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <LoaderCircle className={`h-4 w-4 ${isBootingMap ? "animate-spin" : ""}`} />
                      Preparing map...
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {mapReady
                  ? "Live map is ready. Tap a pin to see cheap food spots and student discounts."
                  : "Use the curated list instantly, or load the live map when you want location details."}
              </p>
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6">
              <p className="font-medium text-slate-900">Mapbox token not configured yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to `.env.local` to unlock the live campus map. The curated deals list is available on the right already.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {CAMPUS_DEALS.map((deal) => (
          <Card key={deal.id} className="border-white/60 bg-white/90 shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="rounded-2xl bg-secondary/60 p-3">
                {deal.type === "discount" ? <BadgePercent className="h-5 w-5" /> : <UtensilsCrossed className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{deal.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{deal.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">{deal.priceHint}</span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
                    {UNIVERSITY_SPOTS.find((spot) => spot.id === deal.universityId)?.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button type="button" variant="outline" className="w-full rounded-full">
          <MapPin className="mr-2 h-4 w-4" />
          Submit a new deal spot
        </Button>
      </div>
    </div>
  );
}
