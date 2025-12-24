import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  AlertTriangle, 
  Shield,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientRisk } from "@/hooks/useClientRisk";

const AdminClientRisk = () => {
  const { isLoading } = useClientRisk();

  const getRiskBadge = (band: string) => {
    switch (band) {
      case "low": return <Badge className="bg-green-500">Low Risk</Badge>;
      case "medium": return <Badge className="bg-yellow-500">Medium Risk</Badge>;
      case "high": return <Badge className="bg-orange-500">High Risk</Badge>;
      case "critical": return <Badge className="bg-red-500">Critical</Badge>;
      default: return <Badge>{band}</Badge>;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return "bg-green-500";
    if (score <= 50) return "bg-yellow-500";
    if (score <= 75) return "bg-orange-500";
    return "bg-red-500";
  };

  // Mock data for display
  const mockClients = [
    { id: "1", name: "John Smith", email: "john@example.com", risk_score: 15, risk_band: "low", events: 2 },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", risk_score: 45, risk_band: "medium", events: 5 },
    { id: "3", name: "Mike Brown", email: "mike@example.com", risk_score: 72, risk_band: "high", events: 8 },
    { id: "4", name: "Emily Davis", email: "emily@example.com", risk_score: 8, risk_band: "low", events: 1 },
    { id: "5", name: "Chris Wilson", email: "chris@example.com", risk_score: 88, risk_band: "critical", events: 12 },
  ];

  const lowRiskCount = mockClients.filter(c => c.risk_band === 'low').length;
  const mediumRiskCount = mockClients.filter(c => c.risk_band === 'medium').length;
  const highRiskCount = mockClients.filter(c => c.risk_band === 'high').length;
  const criticalCount = mockClients.filter(c => c.risk_band === 'critical').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/trust-safety" className="hover:text-primary">Trust & Safety</Link>
              <span>/</span>
              <span>Client Risk Scores</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Client Risk Scores</h1>
            <p className="text-muted-foreground mt-1">
              View client risk assessments and history
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Risk</p>
                    <p className="text-2xl font-bold">{lowRiskCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Medium Risk</p>
                    <p className="text-2xl font-bold">{mediumRiskCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">High Risk</p>
                    <p className="text-2xl font-bold">{highRiskCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Critical</p>
                    <p className="text-2xl font-bold">{criticalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search clients by name or email..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="score">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Risk Score (High → Low)</SelectItem>
                    <SelectItem value="score_asc">Risk Score (Low → High)</SelectItem>
                    <SelectItem value="name">Name (A → Z)</SelectItem>
                    <SelectItem value="events">Event Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Client List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Client Risk Profiles
              </CardTitle>
              <CardDescription>View detailed risk assessments and event history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{client.name}</p>
                          {getRiskBadge(client.risk_band)}
                        </div>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Risk Score</span>
                          <span className="text-xs font-medium">{client.risk_score}</span>
                        </div>
                        <Progress value={client.risk_score} className={`h-2 ${getRiskColor(client.risk_score)}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{client.events}</p>
                        <p className="text-xs text-muted-foreground">Events</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link to="/admin/trust-safety">← Back to Trust & Safety</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminClientRisk;
