import { useState } from 'react';
import { useDevBypass } from '@/hooks/useDevBypass';
import { UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wrench, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating dev-only widget. Renders ONLY when useDevBypass().allowed is true.
 * Lets the owner toggle bypass mode and override their effective role.
 */
export function DevToolsWidget() {
  const { allowed, active, state, update } = useDevBypass();
  const [open, setOpen] = useState(false);

  if (!allowed) return null;

  const roles: (UserRole | 'none')[] = ['none', 'client', 'cleaner', 'admin'];

  return (
    <div className="fixed bottom-4 left-4 z-[9999] font-sans">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-2 shadow-lg border text-xs font-medium transition-all',
            active
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-muted',
          )}
          title="PureTask Dev Tools"
        >
          <Wrench className="h-3.5 w-3.5" />
          {active ? 'Bypass ON' : 'Dev Tools'}
        </button>
      ) : (
        <div className="w-72 rounded-xl border border-border bg-background shadow-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wrench className="h-4 w-4" /> Dev Tools
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug">
            Preview-only. Disables auth/role/setup redirects so you can view any page.
          </p>

          <div className="flex items-center justify-between">
            <Label htmlFor="bypass-on" className="text-xs">
              Bypass all redirects
            </Label>
            <Switch
              id="bypass-on"
              checked={state.enabled}
              onCheckedChange={(v) => update({ enabled: v })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Pretend role</Label>
            <div className="grid grid-cols-4 gap-1">
              {roles.map((r) => {
                const selected = (state.roleOverride ?? 'none') === r;
                return (
                  <Button
                    key={r}
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    className="h-7 text-[11px] capitalize px-1"
                    onClick={() =>
                      update({ roleOverride: r === 'none' ? null : (r as UserRole) })
                    }
                  >
                    {r}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-border">
            {(
              [
                ['skipRoleSelection', 'Skip role selection'],
                ['skipOnboarding', 'Skip cleaner onboarding'],
                ['skipSetup', 'Skip client setup'],
                ['skipRoleGuard', 'Allow any-role pages'],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between">
                <Label htmlFor={k} className="text-[11px]">
                  {label}
                </Label>
                <Switch
                  id={k}
                  checked={state[k]}
                  onCheckedChange={(v) => update({ [k]: v } as any)}
                  disabled={!state.enabled}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
