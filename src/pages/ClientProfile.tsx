import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAddresses } from "@/hooks/useAddresses";
import { 
  User, 
  Mail, 
  Edit, 
  MapPin, 
  Home, 
  Wallet, 
  Bell, 
  Heart, 
  Building2,
  Shield,
  Key,
  Trash2,
  ChevronRight,
  CheckCircle
} from "lucide-react";

export default function ClientProfile() {
  const { user } = useAuth();
  const { clientProfile, isLoading: profileLoading } = useUserProfile();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (profileLoading) {
    return (
      <main className="flex-1 py-8">
        <div className="container max-w-3xl space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your account</p>
          </div>
          <Button asChild>
            <Link to="/profile/edit" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
        <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(user?.name || clientProfile?.first_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium text-lg">
                    {clientProfile?.first_name} {clientProfile?.last_name || ""}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                    <CheckCircle className="h-3 w-3 text-success" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Saved Addresses
                </CardTitle>
                <CardDescription>Manage your home and work addresses</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile/edit#addresses">Manage</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {addressesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : !addresses || addresses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Home className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No addresses saved yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/profile/edit#addresses">Add your first address</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.slice(0, 3).map((address) => (
                  <div 
                    key={address.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {address.label?.toLowerCase().includes("work") ? (
                        <Building2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Home className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{address.label || "Address"}</p>
                        {address.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.line1}, {address.city}
                      </p>
                    </div>
                  </div>
                ))}
                {addresses.length > 3 && (
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/profile/edit#addresses">
                      View all {addresses.length} addresses
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access your account features</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <Link 
                to="/wallet" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Wallet & Credits</p>
                    <p className="text-sm text-muted-foreground">Manage your credits and payments</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/notification-settings" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Email, push, and SMS preferences</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/favorites" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium">Favorite Cleaners</p>
                    <p className="text-sm text-muted-foreground">Your saved cleaning professionals</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/properties" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">Properties</p>
                    <p className="text-sm text-muted-foreground">Manage your properties and units</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription>Security and privacy options</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <Link 
                to="/profile/edit#security" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your login credentials</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/profile/edit#delete" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-destructive"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm opacity-70">Permanently remove your account</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
