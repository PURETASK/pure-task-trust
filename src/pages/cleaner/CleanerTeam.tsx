import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCleanerTeams, CleanerTeam as CleanerTeamType } from "@/hooks/useCleanerTeams";
import { useTeamMembers, TeamMember } from "@/hooks/useTeamMembers";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Plus, UserMinus, Crown, Mail, Loader2, Copy, Check,
  CheckCircle, Clock, XCircle, ShieldAlert, Calendar, Shield
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

// Background check status badge component
function BackgroundCheckBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <ShieldAlert className="h-3 w-3 mr-1" />
        Not Started
      </Badge>
    );
  }

  switch (status.toLowerCase()) {
    case "passed":
    case "clear":
    case "approved":
      return (
        <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground">
          <CheckCircle className="h-3 w-3 mr-1" />
          Passed
        </Badge>
      );
    case "pending":
    case "in_progress":
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "failed":
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <ShieldAlert className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
  }
}

// Member card component
function MemberCard({ 
  member, 
  isOwner, 
  onRemove,
  isRemoving
}: { 
  member: TeamMember; 
  isOwner: boolean;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const initials = [
    member.cleaner_profile?.first_name?.[0] || '',
    member.cleaner_profile?.last_name?.[0] || ''
  ].join('').toUpperCase() || '?';

  const name = [
    member.cleaner_profile?.first_name,
    member.cleaner_profile?.last_name
  ].filter(Boolean).join(' ') || 'Unknown Member';

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{name}</p>
            {member.role === "lead" && (
              <Badge variant="secondary" className="text-xs">Lead</Badge>
            )}
            {member.status === "pending" && (
              <Badge variant="outline" className="text-xs">Pending</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            <BackgroundCheckBadge status={member.background_check?.status || null} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Joined {format(new Date(member.joined_at), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      {isOwner && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserMinus className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}

export default function CleanerTeam() {
  const { toast } = useToast();
  const { profile } = useCleanerProfile();
  const { ownedTeams, isLoading, createTeam, updateTeam, deleteTeam, cleanerId } = useCleanerTeams();
  const isCreating = createTeam.isPending;
  const isDeleting = deleteTeam.isPending;
  const memberTeams: typeof ownedTeams = [];
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  
  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<CleanerTeamType | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Team detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTeam, setDetailTeam] = useState<CleanerTeamType | null>(null);

  // Remove member confirmation
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  // Get team members for the selected detail team
  const { 
    members, 
    isLoading: loadingMembers, 
    memberCount, 
    pendingCount,
    removeMember 
  } = useTeamMembers(detailTeam?.id || null);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({ title: "Team name required", variant: "destructive" });
      return;
    }

    try {
      await createTeam.mutateAsync({ name: teamName, description: teamDescription });
      toast({ title: "Team created!", description: `${teamName} is ready for members.` });
      setCreateDialogOpen(false);
      setTeamName("");
      setTeamDescription("");
    } catch (error: any) {
      toast({ title: "Failed to create team", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await deleteTeam.mutateAsync(teamId);
      toast({ title: "Team deleted" });
    } catch (error: any) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    }
  };

  const handleInviteClick = (team: CleanerTeamType, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTeam(team);
    setInviteEmail("");
    setCopied(false);
    setInviteDialogOpen(true);
  };

  const handleTeamClick = (team: CleanerTeamType) => {
    setDetailTeam(team);
    setDetailDialogOpen(true);
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    // TODO: Implement actual invite sending via edge function
    toast({ 
      title: "Invite sent!", 
      description: `Invitation sent to ${inviteEmail}` 
    });
    setInviteDialogOpen(false);
    setInviteEmail("");
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-team/${selectedTeam?.id}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    await removeMember.mutateAsync(memberToRemove.id);
    setMemberToRemove(null);
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Team</h1>
            <p className="text-muted-foreground mt-1">Manage your cleaning team</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Team</DialogTitle>
                <DialogDescription>
                  Create a team to collaborate with other cleaners on larger jobs.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Team Name</Label>
                  <Input
                    placeholder="e.g., Downtown Cleaners"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Tell others about your team..."
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreateTeam}
                  disabled={isCreating}
                >
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Teams I Own */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Teams I Own
              </h2>
              {ownedTeams.length > 0 ? (
                <div className="space-y-4">
                  {ownedTeams.map((team) => (
                    <Card 
                      key={team.id} 
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleTeamClick(team)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{team.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {team.description || "No description"}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="gap-1">
                                  <Shield className="h-3 w-3" />
                                  Verification Required
                                </Badge>
                                <Badge variant={team.is_active ? "default" : "secondary"}>
                                  {team.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => handleInviteClick(team, e)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Invite
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeam(team.id);
                              }}
                              disabled={isDeleting}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">You haven't created any teams yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a team to collaborate on larger jobs
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Teams I'm a Member Of */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Teams I'm In
              </h2>
              {memberTeams.length > 0 ? (
                <div className="space-y-4">
                  {memberTeams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {team.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      You're not a member of any other teams
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite to {selectedTeam?.name}</DialogTitle>
              <DialogDescription>
                Send an invitation or share a link to join your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="email"
                    placeholder="cleaner@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={handleSendInvite}>
                    Send
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or share link
                  </span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCopyInviteLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Link
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Detail Dialog with Members */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                {detailTeam?.name}
              </DialogTitle>
              <DialogDescription>
                {detailTeam?.description || "No description provided"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="text-xl font-bold">{memberCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{pendingCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="mt-1" variant={detailTeam?.is_active ? "default" : "secondary"}>
                    {detailTeam?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Verification Requirement Notice */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Verification Required</p>
                  <p className="text-xs text-muted-foreground">
                    All team members must complete a background check and ID verification to participate in team jobs.
                  </p>
                </div>
              </div>

              {/* Members List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (detailTeam) {
                        setSelectedTeam(detailTeam);
                        setInviteDialogOpen(true);
                      }
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                {loadingMembers ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        isOwner={true}
                        onRemove={() => setMemberToRemove(member)}
                        isRemoving={removeMember.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border rounded-lg border-dashed">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No members yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invite cleaners to join your team
                    </p>
                  </div>
                )}
              </div>

              {/* Created Date */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Created {detailTeam?.created_at && format(new Date(detailTeam.created_at), "MMMM d, yyyy")}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (detailTeam) {
                      setSelectedTeam(detailTeam);
                      setInviteDialogOpen(true);
                    }
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Member Confirmation Dialog */}
        <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove team member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                <span className="font-medium">
                  {memberToRemove?.cleaner_profile?.first_name || "this member"}
                </span>{" "}
                from your team? They will need to be invited again to rejoin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleConfirmRemove}
              >
                {removeMember.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CleanerLayout>
  );
}
