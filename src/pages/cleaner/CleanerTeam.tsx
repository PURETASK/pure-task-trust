import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCleanerTeams } from "@/hooks/useCleanerTeams";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, UserMinus, Crown, Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CleanerTeam() {
  const { toast } = useToast();
  const { profile } = useCleanerProfile();
  const { ownedTeams, isLoading, createTeam, updateTeam, deleteTeam } = useCleanerTeams();
  const isCreating = createTeam.isPending;
  const isDeleting = deleteTeam.isPending;
  // No memberTeams in current schema (team_members table doesn't exist)
  const memberTeams: typeof ownedTeams = [];
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

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
                    <Card key={team.id}>
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
                                <Badge variant="secondary">
                                  Max {team.max_members} members
                                </Badge>
                                <Badge variant={team.is_active ? "success" : "secondary"}>
                                  {team.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Invite
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTeam(team.id)}
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
      </div>
    </CleanerLayout>
  );
}
