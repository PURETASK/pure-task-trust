import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Filter, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const cleaners = [
  {
    id: "1",
    name: "Sarah Mitchell",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 4.9,
    reviews: 127,
    reliability: 98,
    rate: "35-50",
    services: ["Standard Clean", "Deep Clean", "Move-out"],
    distance: "2.3 mi",
    verified: true,
  },
  {
    id: "2",
    name: "Mike Robinson",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 4.8,
    reviews: 89,
    reliability: 96,
    rate: "30-45",
    services: ["Standard Clean", "Office Clean"],
    distance: "3.1 mi",
    verified: true,
  },
  {
    id: "3",
    name: "Emma Thompson",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    rating: 5.0,
    reviews: 64,
    reliability: 100,
    rate: "40-60",
    services: ["Deep Clean", "Eco-friendly", "Move-out"],
    distance: "4.5 mi",
    verified: true,
  },
  {
    id: "4",
    name: "David Chen",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    rating: 4.7,
    reviews: 52,
    reliability: 94,
    rate: "28-40",
    services: ["Standard Clean", "Post-construction"],
    distance: "5.2 mi",
    verified: true,
  },
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [smartMatch, setSmartMatch] = useState(false);

  const filteredCleaners = cleaners.filter((cleaner) =>
    cleaner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Find Cleaners</h1>
              <p className="text-muted-foreground">Browse verified cleaners in your area</p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="smart-match"
                    checked={smartMatch}
                    onCheckedChange={setSmartMatch}
                  />
                  <Label htmlFor="smart-match" className="text-sm cursor-pointer">
                    Smart Match
                  </Label>
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCleaners.map((cleaner, index) => (
                <motion.div
                  key={cleaner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-elevated transition-all overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="relative">
                          <img
                            src={cleaner.image}
                            alt={cleaner.name}
                            className="h-full w-32 md:w-40 object-cover"
                          />
                          {cleaner.verified && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="trust" className="gap-1">
                                <Shield className="h-3 w-3" />
                                Verified
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{cleaner.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                  {cleaner.rating}
                                </div>
                                <span>•</span>
                                <span>{cleaner.reviews} reviews</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{cleaner.rate}</p>
                              <p className="text-xs text-muted-foreground">credits/hr</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-3.5 w-3.5" />
                            {cleaner.distance}
                            <span>•</span>
                            <span className="text-success">{cleaner.reliability}% reliable</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {cleaner.services.slice(0, 3).map((service) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>

                          <Button className="w-full" asChild>
                            <Link to={`/cleaner/${cleaner.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
