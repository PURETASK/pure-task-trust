import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAddresses, useAddressActions, Address } from "@/hooks/useAddresses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  Save,
  MapPin, 
  Home, 
  Building2,
  Plus,
  Trash2,
  Key,
  Shield,
  Star,
  Loader2
} from "lucide-react";

export default function ClientProfileEdit() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { clientProfile, isLoading: profileLoading } = useUserProfile();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { createAddress, deleteAddress, setDefaultAddress, isCreating, isDeleting } = useAddressActions();

  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // New address form state
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    if (clientProfile) {
      setFirstName(clientProfile.first_name || "");
      setLastName(clientProfile.last_name || "");
    }
  }, [clientProfile]);

  // Load phone from profiles table
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.phone) setPhone(data.phone);
        });
    }
  }, [user?.id]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSaveProfile = async () => {
    if (!clientProfile?.id || !user?.id) return;
    setSaving(true);

    try {
      // Update client_profiles table
      const { error } = await supabase
        .from("client_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", clientProfile.id);

      if (error) throw error;

      // Update phone in profiles table
      if (phone) {
        const { error: phoneError } = await supabase
          .from("profiles")
          .update({ phone })
          .eq("id", user.id);

        if (phoneError) console.warn("Failed to update phone:", phoneError);
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.line1 || !newAddress.city) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createAddress({
        label: newAddress.label || undefined,
        line1: newAddress.line1,
        line2: newAddress.line2 || undefined,
        city: newAddress.city,
        state: newAddress.state || undefined,
        postalCode: newAddress.postalCode || undefined,
        isDefault: !addresses || addresses.length === 0,
      });
      setShowNewAddress(false);
      setNewAddress({ label: "", line1: "", line2: "", city: "", state: "", postalCode: "" });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await logout();
      // In production, you'd call an edge function to handle account deletion
      toast.success("Account deletion requested");
      navigate("/");
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground mt-1">Update your personal information</p>
          </div>
        </div>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {getInitials(firstName || user?.name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card id="addresses">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Saved Addresses
                </CardTitle>
                <CardDescription>Manage your delivery and service addresses</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNewAddress(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showNewAddress && (
              <Card className="border-primary/50">
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Label (optional)</Label>
                    <Input
                      value={newAddress.label}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Home, Work, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Line 1 *</Label>
                    <Input
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, line1: e.target.value }))}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Line 2</Label>
                    <Input
                      value={newAddress.line2}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, line2: e.target.value }))}
                      placeholder="Apt, Suite, Unit, etc."
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={newAddress.state}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postal Code</Label>
                      <Input
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAddress} disabled={isCreating} className="gap-2">
                      {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Address
                    </Button>
                    <Button variant="ghost" onClick={() => setShowNewAddress(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {addressesLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-muted rounded-lg" />
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ) : !addresses || addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No addresses saved yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {address.label?.toLowerCase().includes("work") ? (
                        <Building2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Home className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{address.label || "Address"}</p>
                        {address.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {address.line1}, {address.city}{address.state ? `, ${address.state}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!address.is_default && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAddress(address.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card id="security">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed: Unknown</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/reset-password">Change</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card id="delete" className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
