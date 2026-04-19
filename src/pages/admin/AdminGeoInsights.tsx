import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const AdminGeoInsights = () => {
  const [layer, setLayer] = useState<"demand" | "supply" | "both">("both");
  const [dateRange, setDateRange] = useState("30");
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const circleLayerRef = useRef<L.LayerGroup | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-geo-insights", dateRange],
    queryFn: async () => {
      const since = subDays(new Date(), parseInt(dateRange)).toISOString();

      const [jobs, cleaners] = await Promise.all([
        supabase.from("jobs")
          .select("id, status, scheduled_start_at")
          .gte("created_at", since)
          .not("status", "eq", "cancelled")
          .limit(500),
        supabase.from("cleaner_profiles")
          .select("id, first_name, latitude, longitude, is_available, jobs_completed")
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .limit(200),
      ]);

      // Get real job addresses for demand points
      const jobIds = (jobs.data || []).map(j => j.id);
      const { data: jobAddresses } = await supabase
        .from("addresses")
        .select("lat, lng, city")
        .not("lat", "is", null)
        .not("lng", "is", null)
        .limit(500);

      const demandPoints = (jobAddresses || [])
        .filter(a => a.lat && a.lng)
        .map(a => ({ lat: a.lat!, lng: a.lng!, weight: 1 }));

      const supplyPoints = (cleaners.data || [])
        .filter(c => c.latitude && c.longitude)
        .map(c => ({ lat: c.latitude!, lng: c.longitude!, name: c.first_name || "Cleaner", available: c.is_available }));

      // Compute gap scores by grouping into geographic cells
      const cellSize = 0.05; // ~5km grid cells
      const demandCells: Record<string, { lat: number; lng: number; demand: number; supply: number; city: string }> = {};

      demandPoints.forEach(p => {
        const key = `${Math.round(p.lat / cellSize)}_${Math.round(p.lng / cellSize)}`;
        if (!demandCells[key]) demandCells[key] = { lat: Math.round(p.lat / cellSize) * cellSize, lng: Math.round(p.lng / cellSize) * cellSize, demand: 0, supply: 0, city: `Area ${key}` };
        demandCells[key].demand++;
      });

      // Match city names from addresses
      (jobAddresses || []).forEach(a => {
        if (!a.lat || !a.lng || !a.city) return;
        const key = `${Math.round(a.lat / cellSize)}_${Math.round(a.lng / cellSize)}`;
        if (demandCells[key]) demandCells[key].city = a.city;
      });

      supplyPoints.forEach(p => {
        const key = `${Math.round(p.lat / cellSize)}_${Math.round(p.lng / cellSize)}`;
        if (demandCells[key]) demandCells[key].supply++;
      });

      const maxDemand = Math.max(1, ...Object.values(demandCells).map(c => c.demand));
      const maxSupply = Math.max(1, ...Object.values(demandCells).map(c => c.supply));

      const gapAreas = Object.values(demandCells)
        .map(cell => {
          const demandScore = Math.round((cell.demand / maxDemand) * 100);
          const supplyScore = Math.round((cell.supply / maxSupply) * 100);
          return { area: cell.city, demandScore, supplyScore, gap: Math.max(0, demandScore - supplyScore) };
        })
        .filter(g => g.demandScore > 10)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 8);

      return { demandPoints, supplyPoints, gapAreas, totalJobs: jobs.data?.length || 0, totalCleaners: cleaners.data?.length || 0 };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([39.8283, -98.5795], 4); // US center, will auto-fit
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    circleLayerRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update circles when data or layer changes
  useEffect(() => {
    if (!mapRef.current || !circleLayerRef.current || !data) return;
    circleLayerRef.current.clearLayers();
    const allPoints: L.LatLng[] = [];

    if (layer === "demand" || layer === "both") {
      data.demandPoints.slice(0, 200).forEach((p) => {
        L.circleMarker([p.lat, p.lng], { radius: 6, color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.5, weight: 1 })
          .addTo(circleLayerRef.current!);
        allPoints.push(L.latLng(p.lat, p.lng));
      });
    }
    if (layer === "supply" || layer === "both") {
      data.supplyPoints.forEach((p) => {
        const color = p.available ? "#22c55e" : "#94a3b8";
        L.circleMarker([p.lat, p.lng], { radius: 8, color, fillColor: color, fillOpacity: 0.7, weight: 2 })
          .bindTooltip(p.name)
          .addTo(circleLayerRef.current!);
        allPoints.push(L.latLng(p.lat, p.lng));
      });
    }

    // Auto-fit map to data points
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [data, layer]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span><span>Geo Insights</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero">Geographic Insights</h1>
            <p className="text-muted-foreground mt-1">Demand vs supply heatmap across service areas</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-5"><div className="flex items-center gap-3"><MapPin className="h-8 w-8 text-destructive/60" /><div><p className="text-2xl font-bold">{data?.totalJobs || 0}</p><p className="text-xs text-muted-foreground">Demand Points</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-success/60" /><div><p className="text-2xl font-bold">{data?.totalCleaners || 0}</p><p className="text-xs text-muted-foreground">Supply Points</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-warning/60" /><div><p className="text-2xl font-bold">{data?.gapAreas?.[0]?.gap || 0}</p><p className="text-xs text-muted-foreground">Top Gap Score</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-primary/60" /><div><p className="text-2xl font-bold">{data?.gapAreas?.length || 0}</p><p className="text-xs text-muted-foreground">Under-served Areas</p></div></div></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />Demand vs Supply Map
                  </CardTitle>
                  <Tabs value={layer} onValueChange={(v) => setLayer(v as any)}>
                    <TabsList className="h-8 text-xs">
                      <TabsTrigger value="demand" className="text-xs px-2">Demand</TabsTrigger>
                      <TabsTrigger value="supply" className="text-xs px-2">Supply</TabsTrigger>
                      <TabsTrigger value="both" className="text-xs px-2">Both</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={containerRef} className="h-[420px] w-full rounded-b-xl overflow-hidden" />
              </CardContent>
            </Card>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-destructive inline-block" />Booking Demand</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-success inline-block" />Available Cleaner</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-muted-foreground inline-block" />Unavailable Cleaner</span>
            </div>
          </div>

          {/* Gap Score Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />Gap Score Ranking
              </CardTitle>
              <CardDescription className="text-xs">Areas with highest demand vs supply imbalance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(data?.gapAreas || []).map((area, i) => (
                  <div key={area.area} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                        <span className="text-sm font-medium">{area.area}</span>
                      </div>
                      <Badge variant={area.gap > 40 ? "destructive" : area.gap > 20 ? "secondary" : "outline"} className="text-xs">
                        Gap: {area.gap}
                      </Badge>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      <div className="rounded-full bg-destructive/70" style={{ width: `${area.demandScore}%` }} />
                    </div>
                    <div className="flex gap-1 h-1.5">
                      <div className="rounded-full bg-success/70" style={{ width: `${area.supplyScore}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Demand: {area.demandScore}</span>
                      <span>Supply: {area.supplyScore}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => {}}>
                + Invite Cleaners to Under-served Areas
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/admin/analytics">← Back to Analytics</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminGeoInsights;
