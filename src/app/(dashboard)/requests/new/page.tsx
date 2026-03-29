"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAidRequest } from "@/app/actions/aid-requests";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2, Navigation, Crosshair, MapPin, Package, AlertTriangle, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import type { ResourceType } from "@prisma/client";

const MUMBAI_PRESETS = [
  { name: "Dharavi", lat: 19.0422, lng: 72.8515 },
  { name: "Kurla West", lat: 19.0726, lng: 72.8794 },
  { name: "Vasai East", lat: 19.3691, lng: 72.8311 },
  { name: "Malad West", lat: 19.1862, lng: 72.8484 },
  { name: "Andheri East", lat: 19.1197, lng: 72.8464 },
  { name: "Bandra West", lat: 19.0596, lng: 72.8295 },
  { name: "Worli", lat: 19.0176, lng: 72.8152 },
  { name: "Dadar", lat: 19.0178, lng: 72.8478 },
  { name: "Colaba", lat: 18.9067, lng: 72.8147 },
  { name: "Thane West", lat: 19.2183, lng: 72.9781 },
  { name: "Borivali East", lat: 19.2328, lng: 72.8568 },
  { name: "Chembur", lat: 19.0522, lng: 72.8949 },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resourceType, setResourceType] = useState<ResourceType>("FOOD");
  const [quantityNeeded, setQuantityNeeded] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [urgency, setUrgency] = useState("3");
  const [notes, setNotes] = useState("");

  const handlePresetLocation = (preset: (typeof MUMBAI_PRESETS)[0]) => {
    setLatitude(preset.lat.toString());
    setLongitude(preset.lng.toString());
    setLocationName(preset.name);
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
          setLocationName("Current GPS Location");
          toast.success("Location acquired successfully", { icon: "🛰️" });
        },
        () => toast.error("Could not trace GPS coordinates")
      );
    } else {
      toast.error("Geolocation not supported by this browser");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createAidRequest({
          resourceType,
          quantityNeeded: parseInt(quantityNeeded),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          locationName: locationName || undefined,
          urgency: parseInt(urgency),
          notes: notes || undefined,
        });
        toast.success("Priority Aid Request Broadcasted!", {
          description: "Relief teams have been notified of your location.",
        });
        router.push("/requests");
      } catch {
        toast.error("System Failure: Unable to broadcast request");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          Dispatch Aid Request
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Enter supply requirements and precise coordinates. Verified requests are immediately allocated to the nearest available relief cluster.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Resource Specifications */}
            <Card className="border-border/60 shadow-md overflow-hidden relative group transition-all duration-300 hover:border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Resource Specifications
                </CardTitle>
                <CardDescription className="text-sm">Select the exact type and quantity of items needed</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Resource Type */}
                  <div className="space-y-2.5">
                    <Label className="text-foreground font-medium text-sm">Resource Type</Label>
                    <Select
                      value={resourceType}
                      onValueChange={(v) => setResourceType((v as ResourceType) || "FOOD")}
                    >
                      <SelectTrigger className="w-full bg-background border-input hover:border-primary/50 transition-colors h-11 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOOD" className="py-2.5 cursor-pointer">
                          <span className="flex items-center gap-2 focus:bg-accent">
                            <span className="text-lg">🍚</span> Food Packets
                          </span>
                        </SelectItem>
                        <SelectItem value="WATER" className="py-2.5 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">💧</span> Drinking Water
                          </span>
                        </SelectItem>
                        <SelectItem value="MEDICINE" className="py-2.5 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">💊</span> Medical Supplies
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2.5">
                    <Label className="text-foreground font-medium text-sm">Quantity Needed</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      value={quantityNeeded}
                      onChange={(e) => setQuantityNeeded(e.target.value)}
                      required
                      className="bg-background border-input hover:border-primary/50 transition-colors h-11 focus-visible:ring-primary/20 shadow-sm"
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div className="space-y-2.5 pt-2">
                  <Label className="text-foreground font-medium flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Severity Level
                  </Label>
                  <Select value={urgency} onValueChange={(v) => setUrgency(v || "3")}>
                    <SelectTrigger className="w-full bg-background border-input hover:border-primary/50 transition-colors h-11 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="py-3 cursor-pointer">
                        <span className="flex items-center gap-2.5 text-destructive font-semibold">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                          Critical — Life Threatening / Immediate
                        </span>
                      </SelectItem>
                      <SelectItem value="2" className="py-3 cursor-pointer">
                        <span className="flex items-center gap-2.5 text-orange-500 font-medium">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                          High — Next 4-6 hours 
                        </span>
                      </SelectItem>
                      <SelectItem value="3" className="py-3 cursor-pointer">
                        <span className="flex items-center gap-2.5 text-yellow-500">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                          Medium — Within 24 hours
                        </span>
                      </SelectItem>
                      <SelectItem value="4" className="py-3 cursor-pointer">
                        <span className="flex items-center gap-2.5 text-emerald-500">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          Low — Standard dispatch queue
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Situation Report */}
            <Card className="border-border/60 shadow-md overflow-hidden relative group transition-all duration-300 hover:border-border">
              <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Situation Report
                </CardTitle>
                <CardDescription className="text-sm">Provide context to help ground teams prepare</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Label className="text-foreground font-medium text-sm">Remarks & Details</Label>
                  <Textarea
                    placeholder="Describe specific conditions: e.g. Route blocked by returning floodwaters, mostly elderly people stranded..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="resize-none bg-background border-input hover:border-primary/50 transition-colors min-h-[120px] focus-visible:ring-primary/20 shadow-sm"
                  />
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Keep it concise and clear</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="border-border/60 shadow-md overflow-hidden h-full flex flex-col relative group transition-all duration-300 hover:border-border">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-primary pointer-events-none">
                <MapPin className="w-32 h-32" />
              </div>
              <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  Target Zone
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-7 flex-1 bg-gradient-to-b from-background to-muted/10">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDetectLocation}
                  className="w-full flex items-center justify-center gap-2 h-12 border border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary transition-all shadow-sm text-sm"
                >
                  <Crosshair className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  Acquire GPS Fix
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground font-bold tracking-widest text-[10px]">Or Select Sector</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {MUMBAI_PRESETS.map((p) => (
                    <Button
                      key={p.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetLocation(p)}
                      className={`text-xs h-8 rounded-full px-3.5 border-border/60 hover:border-primary/60 transition-colors ${
                        locationName === p.name
                          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>

                <div className="space-y-5 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">Latitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="19.0760"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                        className="bg-background border-input h-10 text-sm font-mono shadow-sm focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">Longitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="72.8777"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                        className="bg-background border-input h-10 text-sm font-mono shadow-sm focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">
                      Sector Name / Landmark
                    </Label>
                    <Input
                      placeholder="e.g. Sector 4, MG Road"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="bg-background border-input h-10 text-sm shadow-sm focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t border-border/50 bg-muted/5 mt-auto">
                <Button
                  type="submit"
                  disabled={isPending}
                  size="lg"
                  className="w-full relative group/submit overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 h-12 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover/submit:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2 font-semibold">
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 transition-transform group-hover/submit:translate-x-1" />
                        Broadcast Request
                      </>
                    )}
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
