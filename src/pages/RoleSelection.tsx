import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserRole } from "@/contexts/AuthContext";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setRole, isSettingRole } = useUserProfile();

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    
    try {
      await setRole(role);
      
      toast({
        title: "Role set successfully!",
        description: role === "client" 
          ? "Welcome! Let's find you a cleaner." 
          : "Welcome! Let's set up your cleaner profile.",
      });
      
      // Navigate to appropriate destination
      if (role === "cleaner") {
        // Cleaners go to onboarding first
        navigate("/cleaner/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Role selection error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set role. Please try again.",
        variant: "destructive",
      });
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 pt-32">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3">One more step!</h1>
              <p className="text-muted-foreground">How would you like to use PureTask?</p>
            </div>

            <div className="grid gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedRole === "client" 
                    ? "border-primary shadow-elevated" 
                    : "hover:border-primary/50 hover:shadow-elevated"
                } ${isSettingRole ? "pointer-events-none opacity-70" : ""}`}
                onClick={() => !isSettingRole && handleRoleSelect("client")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    {selectedRole === "client" && isSettingRole ? (
                      <Loader2 className="h-7 w-7 text-primary animate-spin" />
                    ) : (
                      <User className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">I need cleaning</h3>
                    <p className="text-sm text-muted-foreground">Book trusted cleaners for your home</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedRole === "cleaner" 
                    ? "border-success shadow-elevated" 
                    : "hover:border-primary/50 hover:shadow-elevated"
                } ${isSettingRole ? "pointer-events-none opacity-70" : ""}`}
                onClick={() => !isSettingRole && handleRoleSelect("cleaner")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center">
                    {selectedRole === "cleaner" && isSettingRole ? (
                      <Loader2 className="h-7 w-7 text-success animate-spin" />
                    ) : (
                      <Briefcase className="h-7 w-7 text-success" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">I'm a cleaner</h3>
                    <p className="text-sm text-muted-foreground">Set your rates and find clients</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
