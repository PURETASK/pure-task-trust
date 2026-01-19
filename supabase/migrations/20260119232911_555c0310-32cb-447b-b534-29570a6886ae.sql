-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id INTEGER NOT NULL REFERENCES public.cleaner_teams(id) ON DELETE CASCADE,
  cleaner_id UUID NOT NULL REFERENCES public.cleaner_profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'lead')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'removed')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES public.cleaner_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, cleaner_id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team owners can do everything with their team's members
CREATE POLICY "Team owners can manage members"
ON public.team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cleaner_teams ct
    JOIN public.cleaner_profiles cp ON cp.id = ct.owner_cleaner_id
    WHERE ct.id = team_members.team_id
    AND cp.user_id = auth.uid()
  )
);

-- Team members can view their own team's members
CREATE POLICY "Team members can view their team"
ON public.team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cleaner_profiles cp
    WHERE cp.id = team_members.cleaner_id
    AND cp.user_id = auth.uid()
  )
);

-- Cleaners can see pending invites for themselves
CREATE POLICY "Cleaners can see their pending invites"
ON public.team_members
FOR SELECT
USING (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.cleaner_profiles cp
    WHERE cp.id = team_members.cleaner_id
    AND cp.user_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();